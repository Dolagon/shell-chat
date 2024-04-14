import { ref, Ref } from 'vue';

export default function<TKey extends string | number>(initialKeys: TKey[] = []) {
  const loadingState = ref({}) as Ref<Record<TKey, boolean>>;

  // 初始化 loadingState
  initialKeys.forEach(key => {
    loadingState.value[key] = false;
  });

  const startLoading = (key: TKey) => {
    loadingState.value[key] = true;
  };
  const endLoading = (key: TKey) => {
    loadingState.value[key] = false;
  };
  const isLoading = (key: TKey) => loadingState.value[key] || false;

  return {
    startLoading,
    endLoading,
    isLoading
  };
}
