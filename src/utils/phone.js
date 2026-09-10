// 手机号校验模块：线上报名、现场补录、签到统一从这里走，规则只维护一份

// 中国大陆手机号：1 开头，第二位 3-9，共 11 位
const PHONE_RE = /^1[3-9]\d{9}$/;

// 去掉空格和横杠等常见分隔符
function normalizePhone(raw) {
  if (raw == null) return '';
  return String(raw).replace(/[\s-]/g, '');
}

function isValidPhone(phone) {
  return PHONE_RE.test(phone);
}

function last4(phone) {
  return phone.slice(-4);
}

module.exports = { normalizePhone, isValidPhone, last4 };
