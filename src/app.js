const path = require('node:path');
const express = require('express');
const ServiceError = require('./services/ServiceError');
const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', apiRouter);
app.use('/', pagesRouter);

// 404
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: '接口不存在' });
  res.status(404).send('<h1>404</h1><p><a href="/">回活动列表</a></p>');
});

// 统一错误处理：API 返回 JSON，页面返回 HTML
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err instanceof ServiceError ? err.status : 500;
  const message = err instanceof ServiceError ? err.message : '系统繁忙，请稍后再试';
  if (!(err instanceof ServiceError)) console.error(err);
  if (req.path.startsWith('/api/')) return res.status(status).json({ error: message });
  res.status(status).send(`<h1>出错了</h1><p>${message}</p><p><a href="/">回活动列表</a></p>`);
});

module.exports = app;
