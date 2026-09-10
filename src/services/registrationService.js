const eventDao = require('../dao/eventDao');
const registrationDao = require('../dao/registrationDao');
const ServiceError = require('./ServiceError');
const { normalizePhone, isValidPhone } = require('../utils/phone');
const { nowLocal } = require('../utils/time');

function cleanInput({ name, phone, department }) {
  name = String(name || '').trim();
  department = String(department || '').trim();
  phone = normalizePhone(phone);
  if (!name) throw new ServiceError(400, '姓名不能为空');
  if (!isValidPhone(phone)) throw new ServiceError(400, '手机号格式不正确（应为 11 位大陆手机号）');
  return { name, phone, department };
}

function mustGetEvent(eventId) {
  const event = eventDao.findById(Number(eventId));
  if (!event) throw new ServiceError(404, '活动不存在');
  return event;
}

// 线上报名：校验手机号、防重复、受报名上限约束
function registerOnline(eventId, input) {
  const event = mustGetEvent(eventId);
  const { name, phone, department } = cleanInput(input);

  if (registrationDao.findByPhone(event.id, phone)) {
    throw new ServiceError(409, '该手机号已报名，请勿重复提交');
  }
  if (registrationDao.countByEvent(event.id) >= event.capacity) {
    throw new ServiceError(409, '报名人数已满');
  }

  const id = registrationDao.create({
    eventId: event.id,
    name,
    phone,
    department,
    source: 'online',
    createdAt: nowLocal(),
  });
  return registrationDao.findById(id);
}

// 现场补录：手机号同样要校验和去重；若该手机号已报过名，直接返回已有记录
// 补录是现场工作人员操作，不受报名上限限制
function addWalkin(eventId, input) {
  const event = mustGetEvent(eventId);
  const { name, phone, department } = cleanInput(input);

  const existing = registrationDao.findByPhone(event.id, phone);
  if (existing) return { registration: existing, alreadyRegistered: true };

  const id = registrationDao.create({
    eventId: event.id,
    name,
    phone,
    department,
    source: 'walkin',
    createdAt: nowLocal(),
  });
  return { registration: registrationDao.findById(id), alreadyRegistered: false };
}

function listRegistrations(eventId, department) {
  mustGetEvent(eventId);
  return registrationDao.listByEvent(Number(eventId), department || null);
}

module.exports = { registerOnline, addWalkin, listRegistrations };
