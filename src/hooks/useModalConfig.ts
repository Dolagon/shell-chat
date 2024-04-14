import useBaseStore from '@/store/base.ts';
import { computed } from 'vue';

export default function() {
  const base = useBaseStore();
  const modalStyle = computed(() => {
    return base.isMobile ? {
      margin: '0 10px'
    } : {};
  });

  return {
    modalStyle
  };
}
