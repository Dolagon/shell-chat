import { DialogOptions } from 'naive-ui/es/dialog/src/DialogProvider';

interface ConfirmOptionsState {
  title?: string;
  positiveText?: string;
  negativeText?: string;
  onConfirm?: () => Promise<void> | void;
  content: string;
}

/**
 * 提示框封装
 * @param title
 * @param positiveText
 * @param negativeText
 * @param onConfirm
 * @param content
 */
export const confirmOptions = ({ title = '提示', positiveText = '确认', negativeText = '取消', onConfirm = () => {}, content }: ConfirmOptionsState): DialogOptions => ({
  title,
  content,
  positiveText,
  negativeText,
  positiveButtonProps: { type: 'primary' },
  onPositiveClick: onConfirm
});

/**
 * 输入框限制空格输入
 * @param value
 */
export const noSideSpace = (value: string) => !value.startsWith(' ') && !value.endsWith(' ');

/**
 * 输入框只许数字输入
 * @param value
 */
export const onlyAllowNumber = (value: string) => !value || /^\d+$/.test(value);

/**
 * 指定范围随机数
 * @param min
 * @param max
 */
export const randomNum = (min : number, max: number) => Math.floor(Math.random() * (max - min) + min);

/**
 * 随机颜色
 * @param min
 * @param max
 */
export const randomColor = (min : number, max: number) => {
  const r = randomNum(min, max);
  const g = randomNum(min, max);
  const b = randomNum(min, max);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

/**
 * 复制文本内容
 * @param text
 */
export const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

/**
 * 将日期转换为 "yyyy-mm-dd"
 * @param input
 */
export const formatDateYmd = (input: string): string => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * base64 转换为 file
 * @param {string} base64Url base64字符串
 * @param {string} filename 完成文件名
 * @returns
 */
export const base64ToFile = (base64Url: string, filename: string = 'image.jpg') => {
  const arr = base64Url.split(',');
  const res = arr[0].match(/:(.*?);/);
  if (!res) return;
  const mime = res[1];
  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

/**
 * 字节B转化成KB，MB，GB
 * @param limit
 * @returns {string}
 */
export function getUnitsSize(limit: number) {
  let size = '';
  if (limit < 0.1 * 1024) {
    size = limit.toFixed(2) + 'B';
  } else if (limit < 0.1 * 1024 * 1024) {
    size = (limit / 1024).toFixed(2) + 'KB';
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    size = (limit / (1024 * 1024)).toFixed(2) + 'MB';
  } else {
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }
  const sizeStr = size + '';
  const index = sizeStr.indexOf('.');
  const dou = sizeStr.substr(index + 1, 2);
  if (dou == '00') {
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
}
