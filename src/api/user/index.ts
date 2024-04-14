import request from '@/utils/request';
import { LoginData, ResetPwdByEmailData, ResetPwdData, UpdateUserData } from '@/api/user/types';

export function login(data: LoginData) {
  return request.post('/shell/api/user/login', data);
}

export function autoLogin() {
  return request.get('/shell/api/user/auto-login');
}

export function signIn(data: any) {
  return request.post('/shell/api/user/add', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function logout() {
  return request.get('/shell/api/user/logout');
}

export function resetPwd(data: ResetPwdData) {
  return request.post('/shell/api/user/reset', data);
}

export function resetPwdByEmail(data: ResetPwdByEmailData) {
  return request.post('/shell/api/user/forget', data);
}

export function updateUser(data: UpdateUserData | FormData) {
  return request.post('/shell/api/user/edit', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
