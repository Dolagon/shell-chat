import { defineStore } from 'pinia';
import { DeviceType, ThemeType } from '@/utils/types';
import type { GlobalTheme } from 'naive-ui'
import { darkTheme } from 'naive-ui';

interface BaseStoreState {
  device: DeviceType;
  theme: GlobalTheme | null;
  themeName: ThemeType;
}

const useBaseStore = defineStore('base', {
  state: (): BaseStoreState => ({
    device: 'desktop',
    theme: null,
    themeName: 'light'
  }),
  getters: {
    isMobile(state): boolean {
      return state.device === 'mobile';
    }
  },
  actions: {
    setDevice(device: DeviceType) {
     this.device = device;
    },
    setTheme(themeName: ThemeType) {
      this.themeName = themeName;
      if (themeName === 'light') {
        this.theme = null;
        document.documentElement.classList.remove('dark-mode');
      } else {
        this.theme = darkTheme;
        const clsList = document.documentElement.classList;
        if (!clsList.contains('dark-mode')) document.documentElement.classList.add('dark-mode');
      }
      localStorage.setItem('shell-chart-theme', themeName);
    }
  }
});

export default useBaseStore;
