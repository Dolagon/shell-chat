import fs from 'fs';
import cheerio from 'cheerio';

const htmlPath = './dist/index.html';

fs.readFile(htmlPath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // 使用cheerio加载HTML
  const $ = cheerio.load(data);

  // 查找所有script标签并遍历
  $('script').each(function () {
    // 移除nomodule和crossorigin属性
    $(this).removeAttr('nomodule').removeAttr('crossorigin');
    // 检查是否有data-src属性，若有，则替换为src
    if ($(this).attr('data-src')) {
      const dataSrcValue = $(this).attr('data-src');
      $(this).attr('src', dataSrcValue);
      $(this).removeAttr('data-src');
    }
  });
  // 删除 type="module" 的 script 标签
  const modifiedData = $.html().replace(/<script\b[^>]*\btype\s*=\s*["']?module["']?[^>]*>[\s\S]*?<\/script>/g, '');

  fs.writeFile(htmlPath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('done');
  });
});
