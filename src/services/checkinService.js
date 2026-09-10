const eventDao = require('../dao/eventDao');
const registrationDao = require('../dao/registrationDao');
const ServiceError = require('./ServiceError');
const { normalizePhone, isValidPhone } = require('../utils/phone');
const { nowLocal } = require('../utils/time');

function mustGetEvent(eventId) {
  const event = eventDao.findById(Number(eventId));
  if (!event) throw new ServiceError(404, '活动不存在');
  return event;
}

// 签到台查人：后四位必填，姓名首字/首字母选填
function lookup(eventId, phoneLast4, nameInitial) {
  mustGetEvent(eventId);
  phoneLast4 = String(phoneLast4 || '').trim();
  if (!/^\d{4}$/.test(phoneLast4)) throw new ServiceError(400, '请输入手机号后四位');
  nameInitial = String(nameInitial || '').trim().slice(0, 1);
  return registrationDao.search(Number(eventId), phoneLast4, nameInitial);
}

// 幂等签到：同一手机号重复签到不会产生第二次计数
function checkIn(eventId, rawPhone) {
  mustGetEvent(eventId);
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) throw new ServiceError(400, '手机号格式不正确（应为 11 位大陆手机号）');

  const reg = registrationDao.findByPhone(Number(eventId), phone);
  if (!reg) throw new ServiceError(404, '未找到该手机号的报名记录，请先现场补录');

  const changes = registrationDao.markCheckedIn(reg.id, nowLocal());
  if (changes === 0) {
    // 已经签过：返回原签到时间，计数不变
    return { status: 'already', registration: registrationDao.findById(reg.id) };
  }
  return { status: 'checked_in', registration: registrationDao.findById(reg.id) };
}

function summary(eventId, department) {
  mustGetEvent(eventId);
  return {
    totals: registrationDao.summary(Number(eventId)),
    byDepartment: registrationDao.summaryByDepartment(Number(eventId)),
    departments: registrationDao.departments(Number(eventId)),
    registrations: registrationDao.listByEvent(Number(eventId), department || null),
  };
}

module.exports = { lookup, checkIn, summary };
