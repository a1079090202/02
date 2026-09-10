// 测试数据：node scripts/seed.js（已有数据时跳过，可重复执行）
const eventDao = require('../src/dao/eventDao');
const eventService = require('../src/services/eventService');
const registrationService = require('../src/services/registrationService');
const checkinService = require('../src/services/checkinService');

if (eventDao.findAll().length > 0) {
  console.log('已有数据，跳过种子导入（如需重置请删除 data/checkin.db）');
  process.exit(0);
}

const event = eventService.createEvent({
  name: '2026 秋季全员大会',
  eventTime: '2026-09-30 14:00',
  location: '总部 3 楼报告厅',
  capacity: 200,
});
console.log(`已建活动 #${event.id}：${event.name}`);

const people = [
  ['张伟', '13812340001', '技术部'],
  ['李娜', '13812340002', '技术部'],
  ['王强', '13812340003', '产品部'],
  ['赵敏', '13812340004', '产品部'],
  ['陈杰', '13812340005', '市场部'],
  ['刘洋', '13812340006', '市场部'],
  ['孙丽', '13812340007', '行政部'],
  ['周涛', '13812340008', '行政部'],
];

for (const [name, phone, department] of people) {
  registrationService.registerOnline(event.id, { name, phone, department });
}
console.log(`已导入 ${people.length} 条线上报名`);

// 模拟现场：3 人签到、1 人现场补录并签到
for (const phone of ['13812340001', '13812340002', '13812340003']) {
  checkinService.checkIn(event.id, phone);
}
registrationService.addWalkin(event.id, { name: '吴芳', phone: '13812340009', department: '技术部' });
checkinService.checkIn(event.id, '13812340009');
console.log('已模拟 3 人签到 + 1 人现场补录并签到');

const s = checkinService.summary(event.id);
console.log('当前汇总：', s.totals);
