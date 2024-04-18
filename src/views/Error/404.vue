<template>
  <div class="w-full h-screen dark:bg-black flex justify-center items-center">
    <n-result status="404" title="404 资源不存在" description="生活总归带点荒谬">
      <template #footer>
        <n-button @click="handleReturn">返回首页</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { NResult, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
const handleReturn = () => {
  router.push('/');
};
</script>
