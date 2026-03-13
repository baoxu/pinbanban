#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const docsDir = path.join(__dirname, '..', 'docs');
const outputDir = path.join(__dirname, '..', 'html');

// 创建输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// CSS 样式
const css = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>拼板板 - 项目文档</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      color: #2d3436;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8f9fa;
    }
    .container {
      background: white;
      padding: 60px;
      border-radius: 12px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.08);
    }
    h1 {
      font-size: 32px;
      color: #1e90ff;
      border-bottom: 3px solid #1e90ff;
      padding-bottom: 15px;
      margin-top: 0;
    }
    h2 {
      font-size: 24px;
      color: #2d3436;
      border-left: 4px solid #1e90ff;
      padding-left: 15px;
      margin-top: 40px;
    }
    h3 {
      font-size: 20px;
      color: #2d3436;
      margin-top: 30px;
    }
    h4 {
      font-size: 18px;
      color: #636e72;
      margin-top: 25px;
    }
    p { margin: 15px 0; }
    ul, ol { margin: 15px 0; padding-left: 30px; }
    li { margin: 8px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #dfe6e9;
      padding: 12px 15px;
      text-align: left;
    }
    th {
      background: #f1f2f6;
      font-weight: 600;
      color: #2d3436;
    }
    tr:nth-child(even) { background: #f8f9fa; }
    tr:hover { background: #e3f2fd; }
    code {
      background: #f1f2f6;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: "SF Mono", Monaco, Consolas, monospace;
      font-size: 13px;
      color: #e84393;
    }
    pre {
      background: #2d3436;
      color: #dfe6e9;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #1e90ff;
      margin: 20px 0;
      padding: 15px 20px;
      background: #f1f8ff;
      color: #636e72;
    }
    hr {
      border: none;
      border-top: 2px solid #dfe6e9;
      margin: 40px 0;
    }
    .toc {
      background: #f8f9fa;
      padding: 20px 30px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .toc ul { margin: 10px 0; padding-left: 20px; }
    .highlight {
      background: #fff3cd;
      padding: 2px 6px;
      border-radius: 3px;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; padding: 40px; }
      h1 { font-size: 28px; }
      h2 { font-size: 22px; }
      a { color: #2d3436; text-decoration: none; }
      pre { white-space: pre-wrap; word-wrap: break-word; }
      @page { margin: 2cm; }
    }
  </style>
</head>
<body>
  <div class="container">
`;

const cssEnd = `
  </div>
</body>
</html>
`;

// 读取并转换 markdown 文件
function convertMarkdown(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf-8');
  return marked.parse(content);
}

// 生成单个 HTML 文件
function generateSingleHtml(mdFile, outputFile) {
  const mdPath = path.join(docsDir, mdFile);
  const htmlPath = path.join(outputDir, outputFile);
  
  if (!fs.existsSync(mdPath)) {
    console.log(`跳过：${mdFile} (文件不存在)`);
    return;
  }
  
  const htmlContent = convertMarkdown(mdPath);
  const fullHtml = css + htmlContent + cssEnd;
  
  fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
  console.log(`生成：${htmlPath}`);
}

// 生成合并的 HTML 文件（所有文档合在一起）
function generateCombinedHtml() {
  const files = [
    '00-项目汇总 - 给合伙人看.md',
    '01-商业可行性分析.md',
    '02-产品原型设计.md',
    '03-业务流程图.md',
    '04-技术方案与时间估算.md',
    '05-可视化流程图.md'
  ];
  
  let combinedContent = '';
  
  files.forEach((file, index) => {
    const mdPath = path.join(docsDir, file);
    if (fs.existsSync(mdPath)) {
      const htmlContent = convertMarkdown(mdPath);
      
      // 除了第一个文件，其他前面加分页符
      if (index > 0) {
        combinedContent += '<div style="page-break-before: always; margin-top: 60px; border-top: 3px dashed #1e90ff; padding-top: 40px;"></div>';
      }
      
      combinedContent += htmlContent;
      console.log(`合并：${file}`);
    }
  });
  
  const fullHtml = css + combinedContent + cssEnd;
  const outputPath = path.join(outputDir, '拼板板 - 完整文档.html');
  fs.writeFileSync(outputPath, fullHtml, 'utf-8');
  console.log(`\n生成合并文档：${outputPath}`);
}

// 主程序
console.log('🚀 开始转换 Markdown 为 HTML...\n');

// 生成单个文件
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
files.forEach(file => {
  const htmlFile = file.replace('.md', '.html');
  generateSingleHtml(file, htmlFile);
});

console.log('\n');

// 生成合并文件
generateCombinedHtml();

console.log('\n✅ 转换完成！');
console.log('\n📁 输出目录：' + outputDir);
console.log('\n💡 使用方法：');
console.log('   1. 用浏览器打开 html 目录下的任意文件');
console.log('   2. 按 Cmd+P 打印');
console.log('   3. 选择"另存为 PDF"即可生成 PDF');
console.log('\n🎨 推荐：直接打开"拼板板 - 完整文档.html"打印成一份完整的 PDF');
