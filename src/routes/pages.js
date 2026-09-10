const express = require('express');
const eventService = require('../services/eventService');
const registrationService = require('../services/registrationService');
const checkinService = require('../services/checkinService');
const ServiceError = require('../services/ServiceError');
const { esc } = require('../views/layout');
const eventListView = require('../views/eventList');
const eventNewView = require('../views/eventNew');
const eventDetailView = require('../views/eventDetail');
const registerView = require('../views/register');
const checkinView = require('../views/checkin');
const summaryView = require('../views/summary');

const router = express.Router();

// 把业务错误转成带提示的重定向/页面，避免白屏
function backWithError(res, url, err) {
  const msg = err instanceof ServiceError ? err.message : '系统繁忙，请稍后再试';
  res.redirect(`${url}${url.includes('?') ? '&' : '?'}error=${encodeURIComponent(msg)}`);
}

// 活动列表
router.get('/', (req, res) => {
  res.send(eventListView(eventService.listEvents()));
});

// 建活动
router.get('/events/new', (req, res) => {
  res.send(eventNewView({ error: req.query.error }));
});

router.post('/events', (req, res) => {
  try {
    const event = eventService.createEvent(req.body);
    res.redirect(`/events/${event.id}`);
  } catch (err) {
    backWithError(res, '/events/new', err);
  }
});

// 活动详情
router.get('/events/:id', (req, res) => {
  const event = eventService.getEvent(req.params.id);
  const data = checkinService.summary(event.id);
  res.send(eventDetailView(event, data.totals, data.registrations));
});

// 线上报名
router.get('/events/:id/register', (req, res) => {
  const event = eventService.getEvent(req.params.id);
  res.send(registerView(event, { msg: req.query.msg, error: req.query.error }));
});

router.post('/events/:id/register', (req, res) => {
  try {
    registrationService.registerOnline(req.params.id, req.body);
    res.redirect(`/events/${req.params.id}/register?msg=${encodeURIComponent('报名成功，现场请报手机号后四位签到')}`);
  } catch (err) {
    backWithError(res, `/events/${req.params.id}/register`, err);
  }
});

// 签到台
router.get('/events/:id/checkin', (req, res) => {
  const event = eventService.getEvent(req.params.id);
  const data = checkinService.summary(event.id);
  res.send(checkinView(event, data.totals, { msg: req.query.msg, error: req.query.error }));
});

// 现场补录（可勾选补录后立即签到）
router.post('/events/:id/walkin', (req, res) => {
  const id = req.params.id;
  try {
    const { registration, alreadyRegistered } = registrationService.addWalkin(id, req.body);
    let msg = alreadyRegistered ? '该手机号已有报名记录' : `补录成功：${registration.name}`;
    if (req.body.checkin === '1') {
      const result = checkinService.checkIn(id, registration.phone);
      msg += result.status === 'already' ? '（此前已签到，不重复计数）' : '，已签到';
    }
    res.redirect(`/events/${id}/checkin?msg=${encodeURIComponent(msg)}`);
  } catch (err) {
    backWithError(res, `/events/${id}/checkin`, err);
  }
});

// 汇总（可按部门筛选）
router.get('/events/:id/summary', (req, res) => {
  const event = eventService.getEvent(req.params.id);
  const data = checkinService.summary(event.id, req.query.department);
  res.send(summaryView(event, data, req.query.department || ''));
});

// 导出 CSV：报名表 + 签到状态（带 BOM，Excel 打开不乱码）
router.get('/events/:id/export.csv', (req, res) => {
  const event = eventService.getEvent(req.params.id);
  const rows = registrationService.listRegistrations(event.id);

  const header = ['姓名', '手机号', '部门', '渠道', '签到状态', '签到时间', '报名时间'];
  const lines = [header].concat(
    rows.map((r) => [
      r.name,
      r.phone,
      r.department,
      r.source === 'walkin' ? '现场补录' : '线上报名',
      r.checked_in ? '已签到' : '未签到',
      r.checked_in_at || '',
      r.created_at,
    ])
  );
  const csv = '﻿' + lines.map((cols) => cols.map(csvCell).join(',')).join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="attendance-event-${event.id}.csv"`);
  res.send(csv);
});

function csvCell(v) {
  const s = String(v == null ? '' : v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

module.exports = router;
