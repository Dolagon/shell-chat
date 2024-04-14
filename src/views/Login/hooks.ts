import { ref, onMounted, watch, computed, reactive } from 'vue';
import { FormItemRule } from 'naive-ui';
import useBoxTransition from '@/hooks/useBoxTransition';
import useBaseStore from '@/store/base';
import useUserStore from '@/store/user';
import encrypt from '@/utils/encrypt';
import { sendCode, verifyCode } from '@/api/code';
import { login, resetPwdByEmail, signIn } from '@/api/user';
import { useRouter } from 'vue-router';
import regexp from '@/utils/regexp';
import { FormState } from '@/utils/types.ts';
import useNModal from '@/hooks/useNModal.ts';
import useChatStore from '@/store/chat.ts';
import useSendCode from '@/hooks/useSendCode.ts';

interface ForgetResetState {
  email: string,
  code?: string;
  newPwd?: string;
  confirmPwd?: string;
}

interface ForgetEventsState {
  onConfirm: () => void;
  onCancel: () => void;
  onVerifyCode: () => void;
}

interface CaptchaEventsState {
  onConfirm: (val: string, fn: () => void) => void;
}

interface LoginModalState {
  modalForgetPwd: FormState<ForgetResetState, 'code' | 'confirm', ForgetEventsState>;
  modalCaptcha: FormState<{}, 'render' | 'confirm', CaptchaEventsState>;
}

interface LoginFormState {
  account: string;
  password: string;
}

interface LoginEventsState {
  onSubmit: (fn: (code: keyof LoginModalState) => void, code: keyof LoginModalState) => void;
  onLogin: () => void;
}

interface RegisterState extends LoginFormState {
  confirmPwd: string;
  email: string;
  code: string;
}

interface RegisterEventsState {
  onSubmit: () => void;
  onSendCode: () => void;
}

const message = window.$message;
const { num, codeTxt, startSendCode } = useSendCode();

export const useLoginModal = () => {
  const modalConfig = reactive<LoginModalState>({
    modalForgetPwd: {
      show: false,
      loadingState: {
        code: false,
        confirm: false
      },
      title: '重置密码',
      cancelText: '取消',
      confirmText: '下一步',
      width: '400px',
      formRef: null,
      rules: {},
      form: {
        email: ''
      },
      state: 0,
      events: {
        onConfirm: () => {
          const selfState = modalConfig.modalForgetPwd;
          selfState.formRef?.validate(async errors => {
            if (errors) return;
            selfState.loadingState.confirm = true;
            try {
              if (!selfState.state) {
                // 验证邮箱
                const { email, code } = selfState.form;
                await verifyCode({ email, code: +(code as string) });
                selfState.rules = {
                  newPwd: { required: true, message: '新密码不能为空', trigger: ['input'] },
                  confirmPwd: {
                    required: true,
                    validator (rule: FormItemRule, value: string) {
                      if (!value) {
                        return new Error('确认密码不能为空')
                      } else if (value !== selfState.form.newPwd) {
                        return new Error('两次输入密码不一致')
                      }
                      return true
                    },
                    trigger: ['input']
                  }
                };
                selfState.form = {
                  email: selfState.form.email,
                  newPwd: '',
                  confirmPwd: ''
                };
                selfState.confirmText = '确 认';
                selfState.state = 1;
              } else {
                // 重置密码
                const { email, newPwd } = selfState.form;
                const { msg } = await resetPwdByEmail({ email, newPwd: encrypt(newPwd as string) });
                message.success(msg);
                selfState.show = false;
              }
            } finally {
              selfState.loadingState.confirm = false;
            }
          });
        },
        onCancel: () => {
          modalConfig.modalForgetPwd.show = false;
        },
        onVerifyCode: () => {
          const selfState = modalConfig.modalForgetPwd;
          selfState.formRef?.validate(async errors => {
            if (errors) return;
            selfState.loadingState.code = true;
            startSendCode(selfState.form.email).finally(() => {
              selfState.loadingState.code = false;
            });
          }, rule => rule?.key === 'email');
        }
      }
    },
    modalCaptcha: {
      show: false,
      loadingState: {
        render: false,
        confirm: false
      },
      title: '安全验证',
      cancelText: '取消',
      confirmText: '确认',
      width: '320px',
      formRef: null,
      form: {},
      events: {
        onConfirm: (val, fn) => {
          if (val !== 'success') return;
          const selfState = modalConfig.modalCaptcha;
          setTimeout(() => {
            selfState.show = false;
            fn();
          }, 300);
        }
      }
    }
  });

  return useNModal<LoginModalState>(modalConfig, modalConfig => ({
    modalForgetPwd: () => {
      const selfModalState = modalConfig.modalForgetPwd;
      selfModalState.state = 0;
      selfModalState.confirmText = '下一步';
      selfModalState.rules = {
        email: {
          key: 'email',
          required: true,
          validator (rule: FormItemRule, value: string) {
            if (!value) {
              return new Error('邮箱不能为空')
            } else if (!regexp.email.test(value)) {
              return new Error('邮箱格式不正确')
            }
            return true
          },
          trigger: ['input']
        },
        code: { required: true, message: '验证码不能为空', trigger: ['input'] }
      };
      selfModalState.form = {
        email: '',
        code: ''
      };
      selfModalState.show = true;
    },
    modalCaptcha: () => {
      modalConfig.modalCaptcha.show = true;
    }
  }));
};

export const useLogin = () => {
  const base = useBaseStore();
  const user = useUserStore();
  const chat = useChatStore();
  const router = useRouter();

  const loginState = reactive<FormState<LoginFormState, 'submit', LoginEventsState>>({
    form: {
      account: '',
      password: ''
    },
    formRef: null,
    loadingState: {
      submit: false
    },
    rules: {
      account: {
        required: true,
        validator (rule: FormItemRule, value: string) {
          if (!value) {
            return new Error('用户名不能为空')
          } else if (regexp.space.test(value)) {
            return new Error('用户名不能包含空格')
          }
          return true
        },
        trigger: ['input']
      },
      password: {
        required: true,
        validator (rule: FormItemRule, value: string) {
          if (!value) {
            return new Error('密码不能为空')
          } else if (regexp.space.test(value)) {
            return new Error('密码不能包含空格')
          }
          return true
        },
        trigger: ['input']
      }
    },
    events: {
      onLogin: () => {
        loginState.loadingState.submit = true;
        const { account, password } = loginState.form;
        login({ account, password: encrypt(password) }).then(({ data }) => {
          const { model, open_context, stream, ...other } = data;
          chat.initChatSetting({ model, openContext: open_context, stream });
          user.setCurrentUser(other);
          router.push({ path: '/' });
        }).finally(() => {
          loginState.loadingState.submit = false;
        });
      },
      onSubmit: (fn, code) => {
        loginState.formRef?.validate(errors => {
          if (errors) return;
          fn(code);
        });
      }
    }
  });
  const registerState = reactive<FormState<RegisterState, 'submit' | 'code', RegisterEventsState>>({
    form: {
      account: '',
      password: '',
      confirmPwd: '',
      email: '',
      code: ''
    },
    formRef: null,
    loadingState: {
      submit: false,
      code: false
    },
    rules: {
      ...loginState.rules,
      confirmPwd: {
        required: true,
        validator (rule: FormItemRule, value: string) {
          if (!value) {
            return new Error('确认密码不能为空')
          } else if (value !== registerState.form.password) {
            return new Error('两次输入密码不一致')
          }
          return true
        },
        trigger: ['input']
      },
      email: {
        key: 'email',
        required: true,
        validator (rule: FormItemRule, value: string) {
          if (!value) {
            return new Error('邮箱不能为空')
          } else if (!regexp.email.test(value)) {
            return new Error('邮箱格式不正确')
          }
          return true
        },
        trigger: ['input']
      },
      code: { required: true, message: '验证码不能为空', trigger: ['input'] }
    },
    events: {
      onSendCode: () => {
        registerState.formRef?.validate(errors => {
          if (errors) return;
          registerState.loadingState.code = true;
          startSendCode(registerState.form.email).finally(() => {
            registerState.loadingState.code = false;
          });
        }, rule => rule?.key === 'email');
      },
      onSubmit: () => {
        registerState.formRef?.validate(async errors => {
          if (errors) return;
          registerState.loadingState.submit = true;
          const { email, code, account, password } = registerState.form;
          try {
            await verifyCode({ email, code: +code });
            const formData = new FormData();
            formData.append('username', account);
            formData.append('password', encrypt(password));
            formData.append('email', email);
            const { msg } = await signIn(formData);
            Object.keys(registerState.form).forEach(key => {
              const typedKey = key as keyof RegisterState;
              registerState.form[typedKey] = '';
            });
            formState.value = 0;
            loginState.form = { account, password };
            message.success(msg);
          } finally {
            registerState.loadingState.submit = false;
          }
        });
      }
    }
  });

  const formState = ref(0); // 0 登录 1 注册
  const cardRef = ref<HTMLElement | null>(null);
  const outerRef = ref<HTMLElement | null>(null);
  const xGap = computed(() => base.device === 'mobile' ? 14 : 18);

  let cancelBoxTransition = () => {}; // 取消 boxTransition 效果
  const handleSwitch = () => {
    formState.value = formState.value ? 0 : 1;
  };

  onMounted(() => {
    if (cardRef.value) {
      const duration = 200;
      const mode = 'ease';
      const cardEl = cardRef.value as HTMLElement;
      const outerEl = outerRef.value as HTMLElement;
      const boxTransition = useBoxTransition(cardEl, duration, mode);
      const keyBoxSizeRef = boxTransition[0];
      cancelBoxTransition = boxTransition[1];
      outerEl.style.setProperty('--transition', `weight ${duration}ms ${mode}, height ${duration}ms ${mode}`);
      watch(keyBoxSizeRef, () => {
        outerEl.style.setProperty('--height', keyBoxSizeRef.value.height + 'px');
        outerEl.style.setProperty('--width', keyBoxSizeRef.value.width + 'px');
      });
    }
  });

  return {
    loginState,
    registerState,
    base,
    formState,
    cardRef,
    outerRef,
    num,
    codeTxt,
    xGap,
    handleSwitch
  };
};
