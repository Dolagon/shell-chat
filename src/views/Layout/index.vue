<template>
  <div class="w-full h-screen">
    <n-layout has-sider class="h-full">
      <n-layout-sider
        v-if="!isMobile"
        collapse-mode="width"
        :collapsed-width="0"
        show-trigger="arrow-circle"
        bordered
        content-style="padding: 14px 10px;"
        :width="240"
        class="bg-gray-50 dark:bg-black"
      >
        <chat-list />
      </n-layout-sider>
      <n-layout>
        <n-layout-header bordered class="h-20 w-full flex justify-between items-center px-8">
          <n-icon v-if="isMobile" size="34" @click="handleList"><reorder-three-sharp /></n-icon>
          <span class="font-bold text-xl">{{ gptModel }}</span>
          <switch-theme />
        </n-layout-header>
        <n-layout-content
          class="bg-white dark:bg-dark-content pt-3 box-border"
          bordered
          content-style="height: calc(100vh - 5.75rem);"
          :native-scrollbar="false"
        >
          <chat />
        </n-layout-content>
      </n-layout>
    </n-layout>
    <n-drawer v-model:show="visibleList" :width="240" placement="left" display-directive="show">
      <div class="w-full h-screen bg-gray-50 dark:bg-black py-2 px-1 box-border">
        <chat-list />
      </div>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, NDrawer, NIcon } from 'naive-ui';
import Chat from '@/views/Chat/index.vue';
import ChatList from '@/views/ChatList/index.vue';
import SwitchTheme from '@/components/SwitchTheme.vue';
import useBaseStore from '@/store/base';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ReorderThreeSharp } from '@vicons/ionicons5';
import useChatStore from '@/store/chat.ts';
import { GPT_MODEL_MAP } from '@/utils/config.ts';
import { emitterChat } from '@/utils/eventbus.ts';

const base = useBaseStore();
const chatStore = useChatStore();
const visibleList = ref(false);
const isMobile = computed(() => base.device === 'mobile');
const gptModel = computed(() => GPT_MODEL_MAP[chatStore.model].title);

const handleList = () => {
  visibleList.value = true;
};

onMounted(() => {
  emitterChat.on('on-close-list', () => {
    visibleList.value = false;
  });
});

onUnmounted(() => {
  emitterChat.off('on-close-list');
});
</script>
