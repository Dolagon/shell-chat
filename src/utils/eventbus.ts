import mitt from 'mitt';

type ChatEventType = {
  'on-chat-item': () => string;
  'on-close-list': undefined;
  'on-chat-new': (_id: string | null) => void;
};

export const emitterChat = mitt<ChatEventType>();

