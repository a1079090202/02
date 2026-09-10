const app = require('./src/app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`活动签到系统已启动：http://localhost:${PORT}`);
});
