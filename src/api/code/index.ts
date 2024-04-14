import request from '@/utils/request';
import { SendCodeData, VerifyCodeData } from '@/api/code/types';

export function sendCode(data: SendCodeData) {
  return request.post('/shell/api/code/send', data);
}

export function verifyCode(data: VerifyCodeData) {
  return request.post('/shell/api/code/verify', data);
}
