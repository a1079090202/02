const express = require('express');
const eventService = require('../services/eventService');
const registrationService = require('../services/registrationService');
const checkinService = require('../services/checkinService');

const router = express.Router();

// 建活动
router.post('/events', (req, res) => {
  const event = eventService.createEvent(req.body);
  res.status(201).json(event);
});

router.get('/events', (req, res) => {
  res.json(eventService.listEvents());
});

router.get('/events/:id', (req, res) => {
  res.json(eventService.getEvent(req.params.id));
});

// 线上报名 / 现场补录（body.source = 'walkin' 时走补录，默认线上报名）
router.post('/events/:id/registrations', (req, res) => {
  if (req.body.source === 'walkin') {
    const result = registrationService.addWalkin(req.params.id, req.body);
    return res.status(result.alreadyRegistered ? 200 : 201).json(result);
  }
  const reg = registrationService.registerOnline(req.params.id, req.body);
  res.status(201).json(reg);
});

// 签到台查人：?last4=1234&initial=张
router.get('/events/:id/lookup', (req, res) => {
  const matches = checkinService.lookup(req.params.id, req.query.last4, req.query.initial);
  res.json({ matches });
});

// 签到（幂等）
router.post('/events/:id/checkin', (req, res) => {
  const result = checkinService.checkIn(req.params.id, req.body.phone);
  res.json(result);
});

// 汇总：?department=技术部 可按部门过滤名单
router.get('/events/:id/summary', (req, res) => {
  res.json(checkinService.summary(req.params.id, req.query.department));
});

module.exports = router;
