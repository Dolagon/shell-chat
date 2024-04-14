import { defineStore } from 'pinia';
import { logout } from '@/api/user';
import { removeToken, setToken } from '@/utils/auth';

interface UserStoreState {
  userInfo: Record<string, any>;
}

const useUserStore = defineStore('user', {
  state: (): UserStoreState => ({
    userInfo: {}
  }),
  actions: {
    setCurrentUser(data: Record<string, any>) {
      this.userInfo = data;
      setToken(data._id);
    },
    setUserInfo(key: string, val: any) {
      this.userInfo[key] = val;
    },
    logout() {
      return new Promise<void>((resolve, reject) => {
        logout().then(() => {
          removeToken();
          this.userInfo = {};
          resolve();
        }).catch(err => {
          reject(err);
        });
      });
    }
  }
});

export default useUserStore;
