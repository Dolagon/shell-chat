import { defineStore } from 'pinia';
import { ChatRoleType, GptModel } from '@/utils/types.ts';

export interface AssistantFormattedState {
  type: string | 'text';
  content: string;
}

export interface ChatDataState {
  role: ChatRoleType;
  content: string | AssistantFormattedState[];
  createTime?: string;
}

interface ChatItemState {
  _id: string;
  chatDataList: ChatDataState[];
}

interface ChatSettingState {
  model: GptModel;
  openContext: boolean;
  stream: boolean;
}

interface ChatStoreState extends ChatSettingState {
  chatList: ChatItemState[];
}

const useChatStore = defineStore('chat', {
  state: (): ChatStoreState => ({
    model: 'gpt-3.5-turbo',
    openContext: true,
    stream: false,
    chatList: [] // 只从chat组件中修改
  }),
  actions: {
    initChatSetting({ model, openContext, stream }: ChatSettingState) {
      this.model = model;
      this.openContext = openContext;
      this.stream = stream;
    },
    setModel(val: GptModel) {
      this.model = val;
    },
    setContext(val: boolean) {
      this.openContext = val;
    },
    setStream(val: boolean) {
      this.stream = val;
    },
    updateChatList(val: ChatItemState) {
      const index = this.chatList.findIndex(({ _id }) => _id === val._id);
      if (index >= 0) this.chatList[index] = val;
      else this.chatList.push(val);
    },
    clearChatList() {
      this.chatList = [];
    }
  }
});

export default useChatStore;
