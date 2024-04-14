import { getUnitsSize } from '@/utils/tools.ts';

type CompressType = (base64Image: string, callback: (compressImage: string) => void) => void;

type ConvertImageToBase64Cb = (base64Image: string, callback?: CompressType) => void;

export default function(files: File, quality = 0.1): Promise<string> {
  function base64ToSize(base64String: string) {
    const base64Data = base64String.split(',')[1];
    const binaryData = atob(base64Data);
    return binaryData.length;
  }
  function convertImageToBase64(file: File, callBack: ConvertImageToBase64Cb) {
    let reader: FileReader | null = new FileReader(); // 实例化读取文件内容对象
    reader.addEventListener('load', e => {
      // 当文件加载完毕后
      const base64Image = e?.target?.result as string; // 获取base64img
      callBack && callBack(base64Image); // 判断callBack是否存在并传入base64img
      reader = null;
    });
    reader.readAsDataURL(file);
  } // 获取图片转为base64
  function compress(base64Image: string, callBack: (compressImage: string) => void) {
    let maxW = 1024; // 最大宽度
    let maxH = 1024; // 最大高度
    const image = new Image();
    image.addEventListener('load', e => {
      // 1. 获取图片宽高
      let radio; // 图片压缩比
      let needCompress = false; // 是否需要压缩
      if (image.naturalWidth > maxW) {
        // 高于最大宽度需要压缩
        needCompress = true;
        radio = image.naturalWidth / maxW; // 宽度需要压缩的比例
        maxH = image.naturalHeight / radio; // 图片高度也需要同比例压缩
      } // 经过处理图片实际尺寸为1024 * 640
      if (image.naturalHeight > maxH) {
        needCompress = true;
        radio = image.naturalHeight / maxH;
        maxW = image.naturalWidth / radio;
      }
      if (!needCompress) {
        //不需要压缩 获取图片实际尺寸
        maxW = image.naturalWidth;
        maxH = image.naturalHeight;
      }

      // 2. 创建canvas开始绘制压缩图片
      const canvas = document.createElement('canvas');
      canvas.setAttribute('id', '__compress__'); // 设置canvas标签id
      canvas.width = maxW;
      canvas.height = maxH;
      canvas.style.visibility = 'hidden';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, maxW, maxH); // 清空像素 防止叠加
      ctx.drawImage(image, 0, 0, maxW, maxH);

      // 3. 压缩绘制的图片 上传
      let compressImage = canvas.toDataURL('image/jpeg', quality); // 将图片转为base64 质量为 0.1
      let bytes = base64ToSize(compressImage);
      console.log('quality', quality);
      console.log('压缩后的大小:', getUnitsSize(bytes)); // 输出压缩后的大小
      callBack && callBack(compressImage); // 将压缩后的图片上传

      // 4. 可以显示压缩后的图片 不必须
      const _image = new Image();
      _image.src = compressImage;
      // document.body.appendChild(_image); // 创建img标签 设置src为base64地址
      canvas.remove();
      console.log('压缩比:' + image.src.length / _image.src.length);
    }); // 图片加载完成时压缩
    image.src = base64Image; // 获取图片
    // document.body.appendChild(image); // 渲染出图片
  } // 图片压缩
  return new Promise(resolve => {
    convertImageToBase64(files, base64Image => compress(base64Image, compressImage => {
      resolve(compressImage);
    }));
  });
}
