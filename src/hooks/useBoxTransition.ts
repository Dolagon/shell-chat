import throttle from 'lodash/throttle';
import { ref } from 'vue';

type BoxSize = {
  width: number
  height: number
}
type BoxSizeRef = globalThis.Ref<BoxSize>

/**
 *
 * @param {HTMLElement} el 要实现过渡的元素 DOM
 * @param {number} duration 过渡动画持续时间，单位 ms
 * @param {string} mode 过渡动画缓动速率，同 CSS transition-timing-function 可选值
 * @returns 返回一个有两个项的元组：第一项为 keyBoxSizeRef，当元素大小发生变化时会将变化后的目标尺寸发送给 keyBoxSizeRef.value；第二项为一个函数，调用后取消对过渡元素尺寸变化的监听
 */
export default function useBoxTransition(el: HTMLElement, duration: number, mode?: string) {
  let boxSizeList: BoxSize[] = []; // boxSizeList 表示对 box 的尺寸的记录数组；为什么是使用列表：因为当 box 尺寸变化的一瞬间，box 的 transform 效果无法及时移除，此时 box 的尺寸可能是非预期的，因此使用列表来记录 box 的尺寸，在必要的时候尽可能地将非预期的尺寸移除
  const keyBoxSizeRef: BoxSizeRef = ref({ width: 0, height: 0 }); // keyBoxSizeRef 是暴露出去的 box 的实时目标尺寸
  let isObserved = false; // box 是否已经开始被观察
  let frameId = 0; // 当前 animationFrame 的 id
  let isTransforming = false; // 当前是否处于变形过渡中

  const elStyle = el.style; // el 的 CSSStyleDeclaration 对象
  const elComputedStyle = getComputedStyle(el); // el 的只读动态 CSSStyleDeclaration 对象

  // 获取当前 boxSize 的函数
  function getBoxSize() {
    const rect = el.getBoundingClientRect(); // el 的 DOMRect 对象
    return { width: rect.width, height: rect.height };
  }

  // 更新 boxSizeList
  function updateBoxsize(boxSize: BoxSize) {
    boxSizeList.push(boxSize);
    // 只保留前最新的 4 条记录
    boxSizeList = boxSizeList.slice(-4);
  }

  // 定义 animationFrame 的回调函数，使得当 box 变形时可以更新 boxSize 记录
  const animationFrameCallback = throttle(() => {
    // 为避免使用了函数节流后，导致回调函数延迟触发使得 cancelAnimationFrame 失败，因此使用 isTransforming 变量控制回调函数中的操作是否执行
    if (isTransforming) {
      const boxSize = getBoxSize();
      updateBoxsize(boxSize);
      frameId = requestAnimationFrame(animationFrameCallback);
    }
  }, 20);

  // 过渡事件的回调函数，在过渡过程中实时更新 boxSize
  function onTransitionStart(e: Event) {
    if (e.target !== el) return;
    // 变形中断的一瞬间，boxSize 的尺寸可能是非预期的，因此在变形开始时，将最新的 3 个可能是非预期的 boxSize 移除
    if (boxSizeList.length > 1) {
      boxSizeList = boxSizeList.slice(0, 1);
    }
    isTransforming = true;
    frameId = requestAnimationFrame(animationFrameCallback);
    // console.log('过渡开始')
  }

  function onTransitionCancel(e: Event) {
    if (e.target !== el) return;
    isTransforming = false;
    cancelAnimationFrame(frameId);
    // console.log('过渡中断')
  }

  function onTransitionEnd(e: Event) {
    if (e.target !== el) return;
    isTransforming = false;
    cancelAnimationFrame(frameId);
    // console.log('过渡完成')
  }

  el.addEventListener('transitionstart', onTransitionStart);
  el.addEventListener('transitioncancel', onTransitionCancel);
  el.addEventListener('transitionend', onTransitionEnd);

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // 被观察的 box 发生尺寸变化时要进行的操作

      // 获取当前回调调用时，box 的宽高
      const borderBoxSize = entry.borderBoxSize[0];
      const writtingMode = elStyle.getPropertyValue('writing-mode');
      const isHorizontal =
        writtingMode === 'vertical-rl' ||
        writtingMode === 'vertical-lr' ||
        writtingMode === 'sideways-rl' ||
        writtingMode === 'sideways-lr'
          ? false
          : true;
      const width = isHorizontal
        ? borderBoxSize.inlineSize
        : borderBoxSize.blockSize;
      const height = isHorizontal
        ? borderBoxSize.blockSize
        : borderBoxSize.inlineSize;

      const boxSize = { width, height };

      // 当 box 尺寸发生变化时以及初次触发回调时，将此刻 box 的目标尺寸暴露给 keyBoxSizeRef
      keyBoxSizeRef.value = boxSize;

      // box 首次被观察时会触发一次回调，此时不需要应用过渡，只需将当前尺寸记录到 boxSizeList 中
      if (!isObserved) {
        isObserved = true;
        boxSizeList.push(boxSize);
        return;
      }

      // 当 box 尺寸发生变化时，使用 FLIP 动画技术产生过渡动画，使用过渡效果的是 scale 形变
      // 根据 First 和 Last 计算出 Inverse 所需的 scale 大小
      const scaleX = boxSizeList[0].width / width;
      const scaleY = boxSizeList[0].height / height;
      // 尺寸发生变化的瞬间，要使用 scale 变形将其保持变化前的尺寸，要先将 transition 去除
      elStyle.setProperty('transition', 'none');
      const originalTransform =
        elStyle.transform || elComputedStyle.getPropertyValue('--transform');
      elStyle.setProperty(
        'transform',
        `${originalTransform} scale(${scaleX}, ${scaleY})`
      );
      // 将 scale 移除，并应用 transition 以实现过渡效果
      setTimeout(() => {
        elStyle.setProperty('transform', originalTransform);
        elStyle.setProperty('transition', `transform ${duration}ms ${mode}`);
      });
    }
  });
  resizeObserver.observe(el);
  const cancelBoxTransition = () => {
    resizeObserver.unobserve(el);
    cancelAnimationFrame(frameId);
  };
  const result: [BoxSizeRef, () => void] = [keyBoxSizeRef, cancelBoxTransition];
  return result;
}

