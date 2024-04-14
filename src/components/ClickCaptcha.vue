<template>
  <!-- ClickCaptcha -->
  <div v-cloak>
    <div class="verify-container" :style="{ width: `${width}px` }">
      <div class="tip">
        <p class="dark:text-black">请在下图依次点击【<span v-for="(item, index) in tips" :key="index">{{ item?.character }}</span>】</p>
        <div class="control">
          <svg @click="reset" t="1711427720145" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4257" width="24" height="24"><path d="M895.469672 511.745197c0-146.498562-82.099856-273.805016-202.78859-338.470805l22.072715-46.630017c-4.50664-12.609179-18.382673-19.176758-30.991852-14.670118l-92.436272 33.040511c-12.609179 4.50664-19.176758 18.382673-14.670117 30.991852l33.04051 92.436272c4.50664 12.609179 18.382673 19.176758 30.991852 14.670117l24.581861-51.929719c99.069343 54.335513 166.240185 159.596881 166.240185 280.561907 0 165.56685-125.817544 301.747415-287.057855 318.14692v0.022513c-17.730826 0-32.105209 14.374382-32.105208 32.105209 0 17.730826 14.374382 32.105209 32.105208 32.105208a32.234145 32.234145 0 0 0 6.135744-0.592494C744.270041 874.039593 895.469672 710.564381 895.469672 511.745197zM480.616222 129.23948c-0.041956 0-0.082888 0.00307-0.124843 0.00307v-0.00307l-0.047072 0.004093c-1.892093 0.010233-3.744277 0.189312-5.545297 0.5137-194.674794 18.529005-346.957083 182.459588-346.957083 381.987924 0 147.431817 83.146699 275.42798 205.097168 339.700819l-24.814152 52.419883c4.50664 12.609179 18.382673 19.176758 30.991852 14.670118l92.436272-33.040511c12.609179-4.50664 19.176758-18.382673 14.670118-30.991851l-33.040511-92.436273c-4.50664-12.609179-18.382673-19.176758-30.991851-14.670117l-21.853727 46.167482c-100.326986-53.964052-168.535461-159.920246-168.535461-281.81955 0-166.089759 126.616746-302.591643 288.588721-318.284044v-0.014326c0.041956 0 0.082888 0.00307 0.124843 0.00307 17.730826 0 32.105209-14.374382 32.105209-32.105209 0.001023-17.730826-14.373359-32.105209-32.104186-32.105208z" p-id="4258"></path></svg>
          <svg @click="shutdown" t="1711681796366" class="icon" viewBox="0 0 1076 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4262" width="22" height="22"><path d="M1074.977 463.141l1.763 1.396q-0.869-0.735-1.763-1.396zM0 465.15l3.184-2.523c-3.822 2.659-6.942 6.058-9.205 10.009z" p-id="4263"></path><path d="M111.983 994.893c-0.282 1.886-0.576 3.759-0.833 5.657 0.53-2.012 0.843-4.326 0.86-6.71zM83.758 1021.833zM55.569 991.477q0.306-2.118 0.637-4.237c-0.43 1.794-0.687 3.859-0.71 5.981z" p-id="4264"></path><path d="M1021.931 984.901c0.355 2.216 0.673 4.445 0.992 6.674-0.088-2.676-0.521-5.217-1.258-7.625zM965.272 999.46c-0.245-1.751-0.502-3.49-0.771-5.229 0.137 2.393 0.541 4.636 1.182 6.776z" p-id="4265"></path><path d="M538.634 0c-282.327 0-512 229.673-512 512s229.673 512 512 512 512-229.673 512-512-229.673-512-512-512zM538.634 950.516c-241.808 0-438.528-196.757-438.528-438.528s196.721-438.516 438.528-438.516 438.528 196.721 438.528 438.528-196.757 438.528-438.528 438.528z" p-id="4266"></path><path d="M748.554 305.446c-6.631-6.706-15.832-10.858-26.003-10.858-10.025 0-19.107 4.034-25.712 10.568l-158.353 156.638-155.944-156.458c-6.621-6.639-15.777-10.747-25.893-10.747-20.195 0-36.566 16.371-36.566 36.566 0 10.079 4.078 19.206 10.674 25.82l155.723 156.249-156.997 155.258c-6.704 6.632-10.856 15.833-10.856 26.003 0 20.197 16.373 36.571 36.571 36.571 10.027 0 19.112-4.036 25.718-10.571l157.214-155.512 158.466 159.030c6.568 6.345 15.524 10.255 25.393 10.255 20.194 0 36.564-16.37 36.564-36.564 0-9.814-3.867-18.726-10.16-25.293l-158.27-158.833 158.136-156.409c6.706-6.631 10.858-15.832 10.858-26.003 0-10.025-4.034-19.107-10.568-25.712z" p-id="4267"></path></svg>
        </div>
      </div>
      <div class="pic">
        <canvas class="canvas" ref="canvas" :width="width" :height="height" @click="createPointer"></canvas>
        <span
          class="pointer"
          v-for="(item, index) in pointer"
          :style="{ left: `${item.x}px`, top: `${item.y}px` }"
        >
          <i>{{ index + 1 }}</i>
        </span>
        <transition name="slide-fade">
          <div v-if="state === 'fail' || state === 'success'" :class="['pic-result', state]">
            <span v-if="state === 'fail'">验证失败，请重试</span>
            <span v-else>验证通过</span>
          </div>
        </transition>
      </div>
    </div>
    <br>
  </div>
</template>

<script setup lang="ts">
import { randomNum } from '@/utils/tools.ts';
import { onMounted, ref } from 'vue';

type stateType = 'success' | 'fail' | 'active' | '';

interface WordVerifyProps {
  accuracy?: number;
  height?: number;
  width?: number;
  characterData?: {
    fontStrArr: string[];
    tipArr: string[];
  } | null;
}

interface PointerState {
  x: number;
  y: number;
}

interface FontDataState extends PointerState{
  character: string;
  skew: number;
}

const props = withDefaults(defineProps<WordVerifyProps>(), {
  width: 300,
  height: 300,
  accuracy: 15, // 精度
  characterData: null,
});
const emit = defineEmits<{
  close: []
  getImg: [] // 获取图片
  completeImg: [] // 图片加载完成
  result: [val: stateType] // 验证结果
}>();

const captchaText = '高吕施浩张孔洁儒曹严华拉金调佳港雷尔口室边魏陶州姜三特殇笔动员韩恩加戚获谢邹取狗百肉慧喻线圈斯狼谷山顶国开柏课鹏博水窦笋章媒林体慎森殒命捷豹云苏潘本葛奚范防守至星际尊彭郎鲁赵钱记孙李周吴郑王朱刘秦尤许何韦昌马苗燕凤花方俞任袁柳酆鲍史唐';
const fontColors = [
  { fill: `#000`, strike: `#f00` },
  { fill: `#FFF9C4`, strike: `#DD2C00` },
  { fill: `#84FFFF`, strike: `#2962FF` },
  { fill: `#D500F9`, strike: `#B3E5FC` },
  { fill: `#f00`, strike: `#B3E5FC` }
];
const pointerPadding = 15;

// 背景图
const bgImg = ref<CanvasImageSource | null>(null);
// 背景画笔
const ctx = ref<CanvasRenderingContext2D | null>(null);
// 显示的字符
const fontArr = ref<FontDataState[]>([]);
// 显示文字
const tips = ref<FontDataState[]>([]);
// 点击序号
const pointer = ref<PointerState[]>([]);
// success fail active
const state = ref<stateType>('');
const canvas = ref<HTMLCanvasElement | null>(null);

// 获取随机字符
const getRandomCharacter = () => {
  const fontStrArr: string[] = [];
  const tipArr: string[] = [];
  const fontNum = Math.floor(Math.random() * 3) + 3; // 3 - 5
  const checkNum = Math.floor(Math.random() * 2) + 2; // 2 - 3
  const getRandomFont = (): string | void => {
    const fontStrLen = captchaText.length;
    const randomIndex = Math.floor(Math.random() * fontStrLen);
    const character = captchaText.charAt(randomIndex);
    const isSome = fontStrArr.some(item => item === character);
    if (isSome) return getRandomFont();
    return character;
  };
  for (let i = 0; i < fontNum; i++) {
    fontStrArr.push(getRandomFont() as string);
  }
  const getTips = (): string | void => {
    const randomIndex = Math.floor(Math.random() * fontStrArr.length);
    const character = fontStrArr[randomIndex];
    if (tipArr.includes(character)) return getTips();
    return character;
  };
  for (let i = 0; i < checkNum; i++) {
    tipArr.push(getTips() as string);
  }
  return {
    fontStrArr,
    tipArr
  };
};
// 绘制背景图
const draw = () => {
  ctx.value?.drawImage(bgImg.value as CanvasImageSource, 0, 0, props.width, props.height);
  let fontStrArr: string[] = [];
  let tipArr: string[] = [];
  if (!props.characterData) {
    const res = getRandomCharacter();
    fontStrArr = res.fontStrArr;
    tipArr = res.tipArr;
  } else {
    fontStrArr = props.characterData.fontStrArr;
    tipArr = props.characterData.tipArr;
  }
  const fontStrLen = fontStrArr.length;
  const tipLen = tipArr.length;
  for (let i = 0; i < fontStrLen; i++) {
    const character = fontStrArr[i];
    const maxFontSize = props.height / 5;
    const fontSize = randomNum(30, maxFontSize);
    const skew = Math.floor(fontSize / 2) + pointerPadding;
    const x = props.width / fontStrLen * i + 10;
    const y = Math.floor(Math.random() * (props.height - fontSize - fontSize + 1)) + fontSize;
    const fontIndex = Math.floor(Math.random() * 5);
    if (ctx.value) {
      ctx.value.save(); // 保存当前绘图状态
      ctx.value.translate(x, y); // 将绘图原点移动到指定位置
      ctx.value.rotate((Math.random() * 30 - 15) * Math.PI / 180); // 旋转字母 -15°-15°
      ctx.value.font = `normal normal ${fontSize}px 宋体`;
      ctx.value.fillStyle = fontColors[fontIndex].fill; // 填充颜色
      ctx.value.strokeStyle = fontColors[fontIndex].strike; // 描边颜色
      ctx.value.lineWidth = 2; // 描边宽度
      ctx.value.fillText(character, 0, 0); // 绘制字母
      ctx.value.strokeText(character, 0, 0); // 绘制描边
      ctx.value.restore(); // 恢复绘图状态，以便下次绘制不受影响
    }
    fontArr.value.push({ character, x, y, skew });
  }
  for (let i = 0; i < tipLen; i++) {
    const res = fontArr.value.find(item => item.character === tipArr[i]);
    if (res) tips.value.push(res);
  }
};
const getImg = () => {
  emit('getImg');
  const img = document.createElement('img');
  // img.crossOrigin = 'Anonymous';
  const fileName = Math.floor(Math.random() * 1000) + 1;
  img.src = `http://file.kaedea.cn:3006/captcha/${fileName}.jpg`;
  bgImg.value = img;
  img.onload = () => {
    console.log('图片加载完成');
    draw();
    emit('completeImg');
  };
};
const init = () => {
  ctx.value = canvas.value?.getContext('2d') as CanvasRenderingContext2D;
  getImg();
};
// 判断精度
const verify = () => pointer.value.every(({ x, y }, index) => {
  const currentTips = tips.value[index];
  const _left = x + currentTips.skew > currentTips.x - props.accuracy;
  const _right = x - currentTips.skew < currentTips.x + props.accuracy;
  const _top = y + currentTips.skew > currentTips.y - props.accuracy;
  const _bottom = y - currentTips.skew < currentTips.y + props.accuracy;
  return _left && _right && _top && _bottom;
});
const reset = () => {
  fontArr.value = [];
  tips.value = [];
  pointer.value = [];
  state.value = '';
  ctx.value?.clearRect(0, 0, props.width, props.height);
  getImg();
};
const shutdown = () => {
  emit('close');
};
const createPointer = (e: MouseEvent) => {
  if (pointer.value.length > 9) return;
  canvas.value?.getBoundingClientRect();
  const x = e.offsetX - pointerPadding;
  const y = e.offsetY - pointerPadding;
  if (pointer.value.length < tips.value.length) {
    pointer.value.push({ x, y });
    state.value = 'active';
  }
  if (pointer.value.length === tips.value.length) {
    const isPass = verify();
    if (isPass) {
      state.value = 'success';
    } else {
      state.value = 'fail';
      // 如果失败则1000毫秒后重置
      setTimeout(() => {
        reset();
      }, 1000);
    }
    emit('result', state.value);
  }
};

onMounted(() => {
  init();
});
</script>`

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translatey(40px);
  opacity: 0;
}
[v-cloak] {
  display: none;
}
.verify-container {
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  user-select: none;
}
.tip {
  width: 100%;
  height: 40px;
  background-color: #fff;
  line-height: 40px;
  display: flex;
  justify-content: space-between;
  align-content: center;
}
.control {
  width: 58px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.pic {
  position: relative;
}
.pic-result {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background-color: #D03050;
  color: #fff;
  text-align: center;
  line-height: 30px;
}
.pic-result.success {
  background: #18A058;
}
.pic-result.fail {
  background: #D03050;
}
.canvas {
  display: block;
}
.pointer {
  background: #039BE5;
  border: 3px solid #fff;
  border-radius: 50%;
  padding: 12px;
  position: absolute;
}
.pointer i {
  color: #fff;
  font-style: normal;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  font-weight: bold;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>

