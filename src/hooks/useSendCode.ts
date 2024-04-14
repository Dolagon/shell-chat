import { ref, watch } from 'vue';
import { sendCode } from '@/api/code';

const message = window.$message;

export default function(text: string = '发送验证码') {
  const timer = ref<NodeJS.Timeout | null>(null);
  const num = ref(60);
  const codeTxt = ref(text);

  const startSendCode = (email: string) => {
    return new Promise<void>((resolve, reject) => {
      sendCode({ email }).then(({ msg }) => {
        message.info(msg);
        num.value--;
        timer.value = setInterval(() => {
          num.value--;
        }, 1000);
        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  };

  watch(() => num.value, val => {
    if (num.value === 60) return;
    if (val === 0) {
      clearInterval(timer.value as NodeJS.Timeout);
      codeTxt.value = text;
      num.value = 60;
    } else {
      codeTxt.value = `${num.value}秒后重新发送`;
    }
  });

  return {
    num,
    codeTxt,
    startSendCode
  };
}
