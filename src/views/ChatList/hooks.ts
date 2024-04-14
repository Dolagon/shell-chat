import useUserStore from '@/store/user';
import { SelectGroupOption, SelectOption, useDialog, InputInst, FormItemRule } from 'naive-ui';
import { useRouter } from 'vue-router';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { IMG_BASE_URL } from '@/utils/config';
import { confirmOptions } from '@/utils/tools';
import useLoading from '@/hooks/useLoading';
import useBaseStore from '@/store/base';
import { chatList, editChat, removeChat } from '@/api/chat';
import { emitterChat } from '@/utils/eventbus.ts';
import useChatStore from '@/store/chat.ts';
import { FormState, GptModel } from '@/utils/types.ts';
import { resetPwd, updateUser } from '@/api/user';
import useNModal from '@/hooks/useNModal.ts';
import useSendCode from '@/hooks/useSendCode.ts';
import { verifyCode } from '@/api/code';
import encrypt from '@/utils/encrypt.ts';

interface SettingState {
  general: {
    context: boolean;
    textStream: boolean;
    model: GptModel;
    requestLimit: number;
  },
  account: {
    photo: string;
    username: string;
    email: string;
  },
  updatePwd: {
    newPwd: string;
    confirmPwd: string;
  }
}

interface CodeState {
  email: string;
  code: string;
  newPwd: string;
}

interface SettingEventsState {
  onContext: (val: boolean) => void;
  onStream: (val: boolean) => void;
  onModel: (val: GptModel, fn: () => void) => void;
  onUpdateAvatar: () => void;
  onUpdateUsername: () => void;
  onSave: (fn: (code: keyof ChatListModalState, val: { email: string; newPwd: string; }) => void, code: keyof ChatListModalState) => void;
}

interface CodeStateEventsState {
  onSubmit: () => void;
}

interface ChatListModalState {
  modalSetting: FormState<SettingState, 'context' | 'stream' | 'model' | 'username'  | 'send', SettingEventsState>;
  modalCode: FormState<CodeState, 'submit', CodeStateEventsState>;
}

interface DataListState {
  _id: string;
  title: string;
  titleLength: number;
  createdAt: string;
  loading: boolean;
}

interface EditFormState {
  _id: string;
  title: string;
}

const message = window.$message;
const chat = useChatStore();
const user = useUserStore();
const { num, codeTxt, startSendCode } = useSendCode('保存');

export const useChatListModel = () => {
  const modalConfig = reactive<ChatListModalState>({
    modalSetting: {
      show: false,
      loadingState: {
        context: false,
        stream: false,
        model: false,
        username: false,
        send: false
      },
      title: '设置',
      width: '460px',
      rules: {
        newPwd: { required: true, message: '新密码不能为空', trigger: ['input'] },
        confirmPwd: {
          required: true,
          validator (rule: FormItemRule, value: string) {
            const selfState = modalConfig.modalSetting;
            if (!value) {
              return new Error('确认密码不能为空')
            } else if (value !== selfState.form.updatePwd.newPwd) {
              return new Error('两次输入密码不一致')
            }
            return true
          },
          trigger: ['input']
        }
      },
      formRef: null,
      options: [
        { label: 'GPT-3.5', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4-turbo-preview' }
      ],
      form: {
        general: {
          context: true,
          textStream: false,
          model: 'gpt-3.5-turbo',
          requestLimit: 10
        },
        account: {
          photo: '',
          username: '',
          email: ''
        },
        updatePwd: {
          newPwd: '',
          confirmPwd: ''
        }
      },
      events: {
        onContext: val => {
          const selfState = modalConfig.modalSetting;
          selfState.loadingState.context = true;
          updateUser({
            _id: user.userInfo._id,
            openContext: val
          }).then(() => {
            selfState.form.general.context = val;
            chat.setContext(val);
          }).catch(() => {
            selfState.form.general.context = chat.openContext;
          }).finally(() => {
            selfState.loadingState.context = false;
          });
        },
        onStream: val => {
          const selfState = modalConfig.modalSetting;
          selfState.loadingState.stream = true;
          updateUser({
            _id: user.userInfo._id,
            stream: val
          }).then(() => {
            selfState.form.general.textStream = val;
            chat.setStream(val);
          }).catch(() => {
            selfState.form.general.textStream = chat.stream;
          }).finally(() => {
            selfState.loadingState.stream = false;
          });
        },
        onModel: (val, fn) => {
          if (val === chat.model) return;
          const selfState = modalConfig.modalSetting;
          selfState.loadingState.model = true;
          updateUser({
            _id: user.userInfo._id,
            model: val
          }).then(() => {
            chat.setModel(val);
            fn();
          }).catch(() => {
            selfState.form.general.model = chat.model;
          }).finally(() => {
            selfState.loadingState.model = false;
          });
        },
        onUpdateAvatar: () => {
          console.log('onUpdateAvatar');
        },
        onUpdateUsername: () => {
          const selfState = modalConfig.modalSetting;
          const { username } = selfState.form.account;
          selfState.loadingState.username = true;
          updateUser({
            _id: user.userInfo._id,
            username
          }).then(() => {
            user.setUserInfo('username', username);
            message.success('用户名已修改');
          }).catch(() => {
            selfState.form.account.username = user.userInfo.username;
          }).finally(() => {
            selfState.loadingState.username = false;
          });
        },
        onSave: (fn, code) => {
          const selfState = modalConfig.modalSetting;
          selfState.formRef?.validate(errors => {
            if (errors) return;
            selfState.loadingState.send = true;
            startSendCode(user.userInfo.email).then(() => {
              fn(code, {
                email: selfState.form.account.email,
                newPwd: selfState.form.updatePwd.newPwd
              });
            }).finally(() => {
              selfState.loadingState.send = false;
            });
          });
        }
      }
    },
    modalCode: {
      show: false,
      loadingState: {
        submit: false
      },
      title: '验证码',
      width: '400px',
      rules: {
        submit: { required: true, message: '验证码不能为空', trigger: ['input'] },
      },
      formRef: null,
      form: {
        email: '',
        code: '',
        newPwd: ''
      },
      events: {
        onSubmit: () => {
          const selfState = modalConfig.modalCode;
          selfState.formRef?.validate(async errors => {
            if (errors) return;
            selfState.loadingState.submit = true;
            const { email, code, newPwd } = selfState.form;
            try {
              await verifyCode({ email, code: +code });
              const { msg } = await resetPwd({ newPwd: encrypt(newPwd) });
              message.success(msg);
              selfState.show = false;
            } finally {
              selfState.loadingState.submit = false;
            }
          });
        }
      }
    }
  });

  return useNModal<ChatListModalState>(modalConfig, modalConfig => ({
    modalSetting: () => {
      const selfState = modalConfig.modalSetting;
      const { model, openContext, stream } = chat;
      const { photo, username, email, chat_limit } = user.userInfo;
      selfState.form.general = {
        context: openContext,
        textStream: stream,
        model,
        requestLimit: chat_limit
      };
      selfState.form.account = {
        photo: `${IMG_BASE_URL}${photo}`,
        username,
        email
      };
      selfState.form.updatePwd = {
        newPwd: '',
        confirmPwd: ''
      };
      selfState.show = true;
    },
    modalCode: val => {
      modalConfig.modalCode.form = {
        email: val.email,
        code: '',
        newPwd: val.newPwd
      };
      modalConfig.modalCode.show = true;
    }
  }));
};

export const useChatList = () => {
  const base = useBaseStore();
  const dialog = useDialog();
  const router = useRouter();
  const { isLoading, startLoading, endLoading } = useLoading<'list'>();
  const avatar = computed(() => `${IMG_BASE_URL}${user.userInfo.photo}`);
  const options: Array<SelectOption | SelectGroupOption> = [
    { label: '设置', value: 0 },
    { label: '退出', value: 1 }
  ];
  const onActive = ref(false);
  const bottomVal = ref<number | null>(null);
  const activeId = ref<string | null>(null);
  const editForm = ref<EditFormState>({
    _id: '',
    title: ''
  });
  const dataList = ref<DataListState[]>([]);
  const titleInputRef = ref<InputInst[] | null>(null);

  const getList = () => {
    startLoading('list');
    return new Promise<void>((resolve, reject) => {
      chatList(chat.model).then(({ data }) => {
        dataList.value = (data || []).map((item: any) => {
          item.titleLength = 0;
          item.loading = false;
          return item;
        });
        resolve();
      }).catch(err => {
        reject(err);
      }).finally(() => {
        endLoading('list');
      });
    });
  };
  const handleCreate = () => {
    onActive.value = true;
    activeId.value = null;
    emitterChat.emit('on-chat-item', () => '');
    emitterChat.emit('on-close-list');
    setTimeout(() => {
      onActive.value = false;
    }, 100);
  };
  const handleItem = ({ _id }: DataListState) => {
    if (activeId.value === _id || editForm.value._id === _id) return;
    activeId.value = _id;
    emitterChat.emit('on-chat-item', () => _id);
    emitterChat.emit('on-close-list');
  };
  const handleEdit = ({ _id, title }: EditFormState) => {
    if (editForm.value._id === _id) return;
    editForm.value = { _id, title };
    nextTick(() => {
      (titleInputRef.value as InputInst[])[0]?.focus();
    });
  };
  const handleSaveTitle = (row: DataListState) => {
    if (row.loading) return;
    const { _id } = row;
    const text = editForm.value.title;
    editForm.value = { _id: '', title: '' };
    row.loading = true;
    editChat({ _id, title: text }).then(() => {
      // row.title = text;
      getList();
    }).finally(() => {
      row.loading = false;
    });
  };
  const handleTitleFocus = (event: MouseEvent, row: DataListState) => {
    row.titleLength = (event.target as HTMLSpanElement).offsetWidth;
  };
  const handleRemove = ({ _id, title }: DataListState) => {
    const confirm = dialog.warning(confirmOptions({
      content: `是否确认删除对话：${title}？`,
      async onConfirm() {
        confirm.loading = true;
        confirm.negativeButtonProps = { disabled: true };
          await removeChat(_id);
          if (activeId.value === _id) handleCreate();
          getList();
      },
    }));
  };
  const handleChange = (val: number, { fn, code }: {
    fn: (code: keyof ChatListModalState) => void;
    code: keyof ChatListModalState;
  } = { fn: () => {}, code: 'modalSetting' }) => {
    emitterChat.emit('on-close-list');
    if (val) {
      const confirm = dialog.warning(confirmOptions({
        content: '是否确认退出登录？',
        async onConfirm() {
          confirm.loading = true;
          confirm.negativeButtonProps = { disabled: true };
          await user.logout();
          chat.clearChatList();
          router.push({ name: 'login' });
        }
      }));
    } else {
      fn(code);
    }
  };
  const handleReload = () => {
    getList().finally(() => {
      handleCreate();
    });
  };

  getList();

  onMounted(() => {
    emitterChat.on('on-chat-new', (callback: (_id: string | null) => void) => {
      getList().then(() => {
        const [{ _id }] = dataList.value;
        activeId.value = _id;
        callback(_id);
      }).catch(() => {
        callback(null);
      });
    });
  });

  onUnmounted(() => {
    emitterChat.off('on-chat-new');
  });

  return {
    base,
    user,
    avatar,
    options,
    bottomVal,
    dataList,
    editForm,
    titleInputRef,
    isLoading,
    activeId,
    onActive,
    num,
    codeTxt,
    handleCreate,
    handleRemove,
    handleEdit,
    handleSaveTitle,
    handleTitleFocus,
    handleItem,
    handleChange,
    handleReload
  };
};
