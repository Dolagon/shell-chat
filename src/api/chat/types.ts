import { ChatRoleType } from '@/utils/types.ts';

export interface CompletionsChatData {
  chatId?: string | null;
  model?: string;
  stream?: boolean;
  messages: { role: ChatRoleType, content: string }[];
}

export interface EditChatData {
  _id: string;
  title: string;
}
