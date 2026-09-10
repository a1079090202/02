// 页面骨架 + HTML 转义
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title, body) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · 活动签到</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="topbar">
    <a href="/" class="brand">活动签到</a>
    <nav><a href="/events/new">+ 建活动</a></nav>
  </header>
  <main class="container">
    ${body}
  </main>
</body>
</html>`;
}

function msgHtml(msg, isError) {
  if (!msg) return '';
  return `<div class="flash ${isError ? 'flash-error' : 'flash-ok'}">${esc(msg)}</div>`;
}

module.exports = { esc, layout, msgHtml };
