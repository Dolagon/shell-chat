<template>
  <n-config-provider :theme="base.theme">
    <n-dialog-provider>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </n-dialog-provider>
    <n-message-provider>
      <n-message />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui';
import { debounce } from 'lodash';
import useBaseStore from '@/store/base';
import { WIDTH } from '@/utils/config';
import NMessage from '@/components/NMessage.vue';
import useUserStore from '@/store/user';
import { getToken } from '@/utils/auth';
import { ThemeType } from '@/utils/types.ts';
import { autoLogin } from '@/api/user';
import useChatStore from '@/store/chat.ts';

const base = useBaseStore();
const user = useUserStore();
const chat = useChatStore();
const currentDevice = () => {
  const rect = document.body.getBoundingClientRect();
  const device = rect.width - 1 < WIDTH ? 'mobile' : 'desktop';
  base.setDevice(device);
};
const listener = debounce(currentDevice, 300);

onMounted(() => {
  if (getToken()) {
    autoLogin().then(({ data }) => {
      const { model, open_context, stream, ...other } = data;
      chat.initChatSetting({ model, openContext: open_context, stream });
      user.setCurrentUser(other);
    });
  }
  currentDevice();
  const theme = localStorage.getItem('shell-chart-theme');
  if (theme) base.setTheme(theme as ThemeType);
  window.addEventListener('resize', listener);
});
onUnmounted(() => {
  window.removeEventListener('resize', listener);
});
</script>
