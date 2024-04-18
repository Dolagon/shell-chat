<template>
  <div class="w-full h-full flex flex-col">
    <div id="chatScroll" class="flex-1 overflow-y-auto">
      <div v-if="isLoading('main')" class="w-full h-full flex justify-center items-center">
        <n-spin size="large" />
      </div>
      <n-scrollbar v-else-if="dataList.length" ref="scrollbarRef" :class="`w-full h-full box-border ${base.isMobile ? 'px-2.5' : 'px-28'}`">
        <n-list :show-divider="false">
          <n-list-item v-for="(item, index) in dataList" :key="index">
            <div class="w-full h-auto flex flex-col assistant-start py-3 text-content">
              <div :class="`w-full flex ${chatRole[item.role].flex}`">
                <n-avatar v-if="item.role === 'assistant'" round size="small" :src="chatRole[item.role].avatar" />
                <div :class="`w-auto overflow-y-auto h-auto p-2 rounded-md mr-2 ml-2 break-all ${chatRole[item.role].bgColor}`" :style="{ maxWidth: base.isMobile ? 'calc(100vw - 100px)' : 'calc(100% - 100px)' }">
                  <template v-if="item.role === 'assistant'">
                    <n-spin :show="!chat.stream && isLoading('answer') && index === dataList.length - 1">
                      <span v-if="isLoading('answer') && index === dataList.length - 1">加载中...</span>
                      <div v-else>
                        <div v-for="(_item, _index) in item.content" :key="_index">
                          <div v-if="_item.type === 'text'" class="whitespace-pre-wrap" v-html="_item.content"></div>
                          <pre v-else class="overflow-auto"><code :class="`language-${_item.type}`" v-html="_item.content"></code></pre>
                        </div>
                      </div>
                    </n-spin>
                  </template>
                  <span v-else>{{ item.content }}</span>
                </div>
                <n-avatar v-if="item.role === 'user'" round size="small" :src="chatRole[item.role].avatar" />
              </div>
              <!-- stream loading -->
              <div v-if="item.role === 'assistant' && isLoading('stream') && index === dataList.length - 1" class="w-full pt-2.5 pl-10 box-border">
                <n-spin size="small" />
              </div>
              <!-- text copy -->
              <div v-if="item.role === 'assistant' && item.content && !isLoading('stream') && typeof item.content !== 'string'" class="w-full flex justify-between items-center h-6 pl-9 pr-12 pt-1 box-border opacity-0 transition-opacity duration-300 copy-text">
                <n-button ghost text :focusable="false" @click="handleCopy(item.content)">
                  <template #icon>
                    <n-icon>
                      <checkmark v-if="isLoading('copy')" />
                      <copy-outline v-else />
                    </n-icon>
                  </template>
                </n-button>
                <span class="ml-4 text-sm text-current">{{ item.createTime }}</span>
              </div>
            </div>
          </n-list-item>
        </n-list>
      </n-scrollbar>
      <div v-else class="w-full h-full flex flex-col justify-center items-center">
        <div :class="`w-full h-40 flex flex-col justify-around items-center ${base.isMobile ? 'mt-1' : 'mt-60'}`">
          <chat-gpt-svg size="40" />
          <div class="mb-5 text-2xl font-medium">How can I help you today?</div>
        </div>
        <div :class="`${base.isMobile ? 'w-full h-96 px-2.5 box-border' : 'w-1/2 h-60'} flex flex-col justify-end items-center`">
          <n-grid :cols="base.isMobile ? 1 : 2" :x-gap="10" :y-gap="10">
            <n-grid-item v-for="(item, index) in promptData" :key="index" :style="{ '--stagger': index + 1 }" data-animate>
              <n-card
                :title="item.title"
                size="small"
                hoverable
                class="cursor-pointer"
                @click="promptSend(item)"
              >{{ item.description }}</n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </div>
    </div>
    <div :class="`w-full h-20 pt-3 flex justify-center items-center box-border ${base.isMobile ? 'px-5' : 'px-28'}`">
      <n-input-group>
        <n-input v-model:value="sendValue" @keyup.enter="handleSend()" type="text" size="large" placeholder="请输入" />
        <n-button :disabled="isLoading('answer') || isLoading('main') || !sendValue" type="primary" size="large" @click="handleSend()">
          <template #icon>
            <n-icon><paper-plane /></n-icon>
          </template>
        </n-button>
      </n-input-group>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NGridItem, NGrid, NSpace, NCard, NTooltip, NSpin, NAvatar, NScrollbar, NList, NListItem, NInput, NInputGroup, NButton, NIcon } from 'naive-ui';
import { useChat } from '@/views/Chat/hooks';
import { Checkmark, PaperPlane, CopyOutline } from '@vicons/ionicons5';
import ChatGptSvg from '@/components/ChatGptSvg.vue';

export default defineComponent({
  name: 'Chat',
  components: { NGridItem, NGrid, NSpace, NCard, Checkmark, NTooltip, CopyOutline, ChatGptSvg, NSpin, NAvatar, NScrollbar, NList, NListItem, NInput, NInputGroup, NButton, NIcon, PaperPlane },
  setup() {
    return {
      loadingSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="14" height="14"><circle cx="50" cy="50" r="40" fill="#000"><animate attributeName="r" dur="1.5s" repeatCount="indefinite" values="40;45;40" /><animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="1;0.5;1" /></circle></svg>`,
      ...useChat()
    };
  }
});
</script>

<style scoped>
.text-content:hover .copy-text {
  opacity: 1;
}
[data-animate] {
  --stagger: 0;
  --delay: 100ms;
  --start: 0ms;
  animation: enter 0.6s both;
  animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
}
@keyframes enter {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
