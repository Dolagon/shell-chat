import { ref, nextTick, computed, ComputedRef, reactive, watch, onMounted, onUnmounted } from 'vue';
import { ScrollbarInst } from 'naive-ui';
import useLoading from '@/hooks/useLoading';
import { BASE_URL, IMG_BASE_URL, MAX_CONTEXT_NUM } from '@/utils/config';
import useUserStore from '@/store/user';
import { chatDetail, completionsChat, promptLibrary } from '@/api/chat';
import useChatStore, { AssistantFormattedState, ChatDataState } from '@/store/chat.ts';
import { ChatRoleType } from '@/utils/types.ts';
import { emitterChat } from '@/utils/eventbus.ts';
import { copyToClipboard } from '@/utils/tools.ts';
import Prism from 'prismjs';
import { CompletionsChatData } from '@/api/chat/types.ts';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { start } from 'nprogress';
import useBaseStore from '@/store/base.ts';
import chatgptImg from '@/assets/images/chatgpt.png';
import { cloneDeep } from 'lodash';

interface RoleOptionsState {
  avatar: ComputedRef<string> | string;
  flex: string;
  bgColor: string;
}

interface PromptLibrary {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  weight: number;
}

const message = window.$message;

export const useChat = () => {
  const user = useUserStore();
  const chat = useChatStore();
  const base = useBaseStore();
  const { isLoading, startLoading, endLoading } = useLoading<'answer' | 'main' | 'copy' | 'stream'>();
  const sendValue = ref('');
  const chatId = ref<string | null>(null);
  const dataList = ref<ChatDataState[]>([]);
  const promptData = ref<PromptLibrary[]>([]);
  const scrollbarRef = ref<ScrollbarInst | null>(null);
  const scrollContainers = ref<NodeListOf<Element> | null>(null);
  const chatRole = reactive<Record<ChatRoleType, RoleOptionsState>>({
    user: {
      avatar: computed(() => `${IMG_BASE_URL}${user.userInfo.photo}`),
      flex: 'justify-end',
      bgColor: 'bg-green-200 dark:bg-green-600'
    },
    assistant: {
      avatar: chatgptImg,
      flex: 'justify-start',
      bgColor: 'bg-gray-200 dark:bg-gray-600'
    }
  });

  const getPrompt = () => {
    promptData.value = [];
    setTimeout(() => {
      promptLibrary().then(({ data }) => {
        promptData.value = data;
      });
    }, 300);
  };
  const promptSend = ({ prompt }: PromptLibrary) => {
    handleSend(prompt);
  };
  const assistantContentEffect = (content: string) => {
    const regex = /```([\s\S]*?)```/g;
    const parts = content.split(regex);
    const formatted: AssistantFormattedState[] = [];
    const blobFont = '<b>$1</b>';
    const blobFontL3 = '<span style="font-weight: 700;font-size: 1.25rem;line-height: 3rem;">$1</span>';
    const blobFontL4 = '<span style="font-weight: 600;font-size: 1rem;line-height: 2.5rem;">$1</span>';
    const separator = '<div style="height: 1px;background-color: #BDBDBD; margin: 20px 0;"></div>';
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        let str = parts[i];
        if (/<[^>]+>/g.test(str) && !/\s<[^>]+>/.test(str)) {
          // 解答内容或包含不需要转义的标签
          str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        const content = str
        .replace(/`([^`]+)`/g, blobFont) // 加粗字体
        .replace(/\*\*(.*?)\*\*/g, blobFont) // 加粗字体
        .replace(/---/g, separator) // 分割线
        .replace(/####(.*?)\n/g, blobFontL4) // 加粗字体 l4 (gpt4)
        .replace(/###(.*?)\n/g, blobFontL3) // 加粗字体 l3 (gpt4)
        .replace(/-\s/g, '• ')
        .replace(/\n\n/g, '\n'); // 双换行替换单换行
        formatted.push({
          type: 'text',
          content: content.startsWith('\n') ? content.substring(1) : content
        });
      } else {
        const index = parts[i].indexOf('\n');
        let language = (index !== -1 ? parts[i].substring(0, index) : parts[i]) || 'bash'; // 获取语言
        const code = index !== -1 ? parts[i].substring(index + 1) : ''; // 获取代码
        const text = code.replace(/\n+$/, ''); // 删除末尾换行
        language = language === 'vue' ? 'html' : language;
        formatted.push({
          type: language,
          content: Prism.highlight(text, Prism.languages[language], language)
        });
      }
    }
    return formatted;
  };
  const scrollEnd = (behavior: ScrollBehavior = 'smooth') => {
    nextTick(() => {
      const scrollDistance: number[] = [];
      scrollContainers.value?.forEach(container => {
        scrollDistance.push(container.scrollHeight - container.clientHeight);
      });
      scrollbarRef.value?.scrollBy({
        behavior,
        top: Math.max(...scrollDistance)
      });
    });
  };
  const reloadList = async () => {
    // 请求左侧列表选中最新添加项并返回最新id
    const _id = await new Promise<string | null>(resolve => {
      emitterChat.emit('on-chat-new', (_id: string | null) => {
        resolve(_id);
      });
    });
    if (!_id) {
      message.error('获取对话信息失败');
      return;
    }
    chatId.value = _id;
    chat.updateChatList({ _id, chatDataList: dataList.value });
  };
  const handleSend = async (val: string = '') => {
    const newChat = !dataList.value.length;
    const { model, stream, openContext } = chat;
    const text = val || sendValue.value;
    sendValue.value = '';
    dataList.value.push({ role: 'user', content: text });
    startLoading('answer');
    await new Promise<void>(resolve => {
      setTimeout(() => {
        dataList.value.push({ role: 'assistant', content: '' });
        scrollEnd();
        resolve();
      }, 300);
    });
    const tempDataList = cloneDeep(dataList.value);
    tempDataList.pop();
    const payload: CompletionsChatData = {
      chatId: newChat ? null : chatId.value,
      model,
      stream,
      messages: openContext ? tempDataList.slice(MAX_CONTEXT_NUM).map(({ content, role }) => ({
        role,
        content: typeof content === 'string' ? content : content.map(item => item.content).join('\n')
      })) : [{ role: 'user', content: text as string }]
    };
    const lastIndex = dataList.value.length - 1;
    if (stream) {
      startLoading('stream');
      const url = `${BASE_URL}/shell/api/chat/completions`;
      const controller = new AbortController(); // 创建AbortController实例，以便中止请求
      const { signal } = controller;
      let contentStr = '';
      const errControl = (err: string) => {
        console.log('errControl', err);
        message.error(err);
        endLoading('answer');
        endLoading('stream');
        dataList.value.splice(-2);
      };
      await fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        openWhenHidden: true, // 取消visibilityChange事件
        signal,
        async onmessage(ev: any) {
          const chunk = JSON.parse(ev.data);
          if (chunk?.err) return errControl(chunk.err);
          const content = chunk.choices[0]?.delta?.content || '';
          contentStr += content;
          try {
            dataList.value[lastIndex] = {
              content: assistantContentEffect(contentStr),
              role: 'assistant',
              createTime: chunk?.createTime
            }
          } catch (e) {
            controller.abort();
            errControl(e + '');
            throw e;
          }
          console.log('nextTick', nextTick);
          nextTick(async () => {
            Prism.highlightAll();
            if (content.includes('\n')) scrollEnd('auto');
          });
          if (chunk.choices[0]?.finish_reason === 'stop') {
            scrollEnd('auto');
            controller.abort();
            // 请求完毕
            endLoading('stream');
            user.setUserInfo('chat_limit', chunk.chatLimit);
            if (newChat) await reloadList();
          }
          endLoading('answer');
        },
        onerror(err: any) {
          errControl(err);
          controller.abort();
          throw err;
        }
      });
      return;
    }
    try {
      const { data } = await completionsChat(payload);
      // 解析文本
      const [{ message }] = data.choices;
      dataList.value[lastIndex] = {
        content: assistantContentEffect(message.content),
        role: message.role,
        createTime: data?.createTime
      };
      nextTick(async () => {
        Prism.highlightAll();
        scrollEnd();
        // 设置请求次数
        user.setUserInfo('chat_limit', data.chatLimit);
        if (newChat) await reloadList();
      });
    } catch (e) {
      message.error(e + '');
      // 删除报错对话
      dataList.value.splice(-2);
    }  finally {
      endLoading('answer');
    }
  };
  const handleCopy = (data: AssistantFormattedState[]) => {
    const text = data.map(item => item.content).join('\n');
    startLoading('copy');
    copyToClipboard(text);
    setTimeout(() => {
      endLoading('copy');
    }, 1000);
  };

  watch(() => dataList.value.length, val => {
    if (val) {
      nextTick(() => {
        scrollContainers.value = document.querySelectorAll('.n-scrollbar-container');
      });
    }
  });

  onMounted(() => {
    getPrompt();
    emitterChat.on('on-chat-item', async (func: () => string) => {
      endLoading('stream');
      endLoading('answer');
      const _id = func();
      if (_id) {
        // 获取对话详情
        chatId.value = _id;
        startLoading('main');
        dataList.value = [];
        try {
          const res = chat.chatList.find(item => item._id === _id);
          if (res) {
            dataList.value = res.chatDataList;
          } else {
            const { data } = await chatDetail(chatId.value as string);
            (data || []).forEach((item: any) => {
              const user: ChatDataState = {
                role: 'user',
                content: item.ask
              };
              const [{ message }] = item.reply.choices;
              const assistant: ChatDataState = {
                content: assistantContentEffect(message.content),
                role: message.role,
                createTime: item.createTime
              };
              dataList.value.push(...[user, assistant]);
              chat.updateChatList({ _id, chatDataList: dataList.value });
            });
          }
          nextTick(() => {
            Prism.highlightAll();
            scrollEnd('auto');
          });
        } catch (e) {
          message.error(e + '');
        } finally {
          endLoading('main');
          scrollEnd();
        }
        return;
      }
      // 新建对话
      chatId.value = null;
      dataList.value = [];
      getPrompt();
    });
  });

  onUnmounted(() => {
    emitterChat.off('on-chat-item');
  });

  return {
    base,
    chat,
    sendValue,
    isLoading,
    dataList,
    scrollbarRef,
    chatRole,
    promptData,
    promptSend,
    handleSend,
    handleCopy
  };
};
