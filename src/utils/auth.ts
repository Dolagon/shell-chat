import Cookies from 'js-cookie';
import { TOKEN_KEY } from '@/utils/config';

export function getToken() {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string) {
  return Cookies.set(TOKEN_KEY, token, { expires: 7 });
}

export function removeToken() {
  return Cookies.remove(TOKEN_KEY);
}
