import { GptModel } from '@/utils/types.ts';

export interface LoginData {
  account: string;
  password: string;
}

export interface ResetPwdData {
  newPwd: string;
}

export interface ResetPwdByEmailData {
  email: string;
  newPwd: string;
}

export interface UpdateUserData {
  _id: string;
  username?: string;
  email?: string;
  phone?: string;
  chatLimit?: number;
  openContext?: boolean;
  stream?: boolean;
  model?: GptModel;
  photo?: File;
}
