// 时间统一为本地时间字符串 'YYYY-MM-DD HH:MM'，全系统不做时区换算

function pad(n) {
  return String(n).padStart(2, '0');
}

function nowLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// datetime-local 输入框给的是 '2026-09-20T14:00'，统一转成空格分隔
function normalizeLocal(str) {
  return String(str || '').trim().replace('T', ' ');
}

function isValidLocal(str) {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(str);
}

module.exports = { nowLocal, normalizeLocal, isValidLocal };
