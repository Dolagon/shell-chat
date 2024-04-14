import { UnwrapNestedRefs } from 'vue';

export default function<TCode, TPayload = any>(
  modalConfig: UnwrapNestedRefs<TCode>,
  modalEvents: (modalConfig: UnwrapNestedRefs<TCode>) => Record<keyof TCode, (val?: TPayload) => void>
) {

  const triggerModalEvent = (code: keyof TCode, val?: TPayload) => {
    modalEvents(modalConfig)[code](val ?? undefined);
  };

  return {
    modalConfig,
    triggerModalEvent
  };
}
