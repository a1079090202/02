const eventDao = require('../dao/eventDao');
const ServiceError = require('./ServiceError');
const { nowLocal, normalizeLocal, isValidLocal } = require('../utils/time');

function createEvent(input) {
  // 同时接受 eventTime 和表单/JSON 里的 event_time
  let { name, location, capacity } = input;
  let eventTime = input.eventTime != null ? input.eventTime : input.event_time;
  name = String(name || '').trim();
  location = String(location || '').trim();
  eventTime = normalizeLocal(eventTime);
  capacity = Number(capacity);

  if (!name) throw new ServiceError(400, '活动名称不能为空');
  if (!isValidLocal(eventTime)) throw new ServiceError(400, '时间格式应为 YYYY-MM-DD HH:MM');
  if (!location) throw new ServiceError(400, '地点不能为空');
  if (!Number.isInteger(capacity) || capacity <= 0) throw new ServiceError(400, '报名上限必须是正整数');

  const id = eventDao.create({ name, eventTime, location, capacity, createdAt: nowLocal() });
  return eventDao.findById(id);
}

function listEvents() {
  return eventDao.findAll();
}

function getEvent(id) {
  const event = eventDao.findById(Number(id));
  if (!event) throw new ServiceError(404, '活动不存在');
  return event;
}

module.exports = { createEvent, listEvents, getEvent };
