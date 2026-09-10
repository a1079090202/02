# 活动签到统计系统

给行政用的活动报名 / 签到 / 统计工具：建活动 → 线上报名（手机号防重）→ 现场签到（后四位 + 姓名首字快查，幂等）→ 自动汇总 + CSV 导出。

## 技术栈

- 后端：Node.js + Express 5
- 数据库：SQLite（Node 22 内置 `node:sqlite`，**无 ORM**，SQL 全部在 `src/dao/`）
- 前端：服务端渲染 + 原生 JS，无前端框架、无 UI 库

## 启动

```bash
npm install
npm run seed   # 可选：导入测试数据（1 场活动 + 8 条报名 + 3 人签到 + 1 人补录）
npm start      # http://localhost:3000
```

## 页面入口

| 页面 | 地址 |
|---|---|
| 活动列表 | `/` |
| 建活动 | `/events/new` |
| 活动详情 | `/events/:id` |
| 线上报名 | `/events/:id/register` |
| 签到台（查人签到 + 现场补录） | `/events/:id/checkin` |
| 汇总（可按部门筛选） | `/events/:id/summary` |
| CSV 导出 | `/events/:id/export.csv` |

## curl 走一遍全流程

```bash
# 1. 建活动
curl -X POST http://localhost:3000/api/events \
  -H 'Content-Type: application/json' \
  -d '{"name":"季度复盘会","event_time":"2026-09-20 14:00","location":"3号会议室","capacity":50}'

# 2. 线上报名（假设活动 id = 1；重复手机号会返回 409）
curl -X POST http://localhost:3000/api/events/1/registrations \
  -H 'Content-Type: application/json' \
  -d '{"name":"张伟","phone":"13800001111","department":"技术部"}'

# 3. 签到台查人：手机号后四位 + 姓名首字（initial 可省略）
curl -G 'http://localhost:3000/api/events/1/lookup' \
  --data-urlencode 'last4=1111' --data-urlencode 'initial=张'

# 4. 签到（幂等：重复提交返回 "already"，计数不变）
curl -X POST http://localhost:3000/api/events/1/checkin \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800001111"}'

# 5. 现场补录（手机号已存在时返回已有记录，不重复建）
curl -X POST http://localhost:3000/api/events/1/registrations \
  -H 'Content-Type: application/json' \
  -d '{"name":"临时访客","phone":"13800002222","department":"外部","source":"walkin"}'

# 6. 查汇总（加 ?department=技术部 可按部门过滤名单）
curl http://localhost:3000/api/events/1/summary

# 7. 导出 CSV（报名表 + 签到状态）
curl -OJ http://localhost:3000/events/1/export.csv
```

## 目录结构

```
server.js              # 启动入口
src/
  app.js               # Express 装配 + 统一错误处理
  db/                  # SQLite 连接与建表 SQL
  dao/                 # 数据访问层：所有 SQL 只写在这里
  services/            # 业务逻辑层：校验、容量控制、幂等签到、汇总
  routes/              # 路由层：api.js（JSON）+ pages.js（SSR 页面），只做参数搬运
  utils/phone.js       # 手机号校验模块（报名、补录、签到共用）
  utils/time.js        # 本地时间工具（全系统不做时区换算）
  views/               # 服务端渲染的页面模板
public/                # style.css + 签到台原生 JS
scripts/seed.js        # 测试数据
data/checkin.db        # SQLite 数据文件（首次启动自动创建）
```

## 关键设计

- **防重复报名**：`registrations` 表 `UNIQUE(event_id, phone)`，业务层先查后插，数据库兜底。
- **签到幂等**：`UPDATE ... SET checked_in=1 WHERE id=? AND checked_in=0`，重复提交影响行数为 0，返回 `already`，计数不变。
- **时间**：统一存本地时间字符串 `YYYY-MM-DD HH:MM`，不做时区换算。
- **报名上限**：只约束线上报名；现场补录由工作人员操作，不受上限限制。
