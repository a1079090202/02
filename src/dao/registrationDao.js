const db = require('../db/connection');

function create({ eventId, name, phone, department, source, createdAt }) {
  const info = db
    .prepare(
      `INSERT INTO registrations (event_id, name, phone, department, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(eventId, name, phone, department, source, createdAt);
  return Number(info.lastInsertRowid);
}

function findById(id) {
  return db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);
}

function findByPhone(eventId, phone) {
  return db.prepare('SELECT * FROM registrations WHERE event_id = ? AND phone = ?').get(eventId, phone);
}

function countByEvent(eventId) {
  return db.prepare('SELECT COUNT(*) AS n FROM registrations WHERE event_id = ?').get(eventId).n;
}

// 签到台快速查人：手机号后四位（必填）+ 姓名首字/首字母（选填）
function search(eventId, phoneLast4, nameInitial) {
  let sql = 'SELECT * FROM registrations WHERE event_id = ? AND substr(phone, -4) = ?';
  const params = [eventId, phoneLast4];
  if (nameInitial) {
    sql += ' AND substr(name, 1, 1) = ? COLLATE NOCASE';
    params.push(nameInitial);
  }
  sql += ' ORDER BY id';
  return db.prepare(sql).all(...params);
}

// 幂等签到：只有 checked_in = 0 的行才会被更新，重复提交 changes = 0
function markCheckedIn(id, checkedInAt) {
  const info = db
    .prepare('UPDATE registrations SET checked_in = 1, checked_in_at = ? WHERE id = ? AND checked_in = 0')
    .run(checkedInAt, id);
  return info.changes;
}

function listByEvent(eventId, department) {
  let sql = 'SELECT * FROM registrations WHERE event_id = ?';
  const params = [eventId];
  if (department) {
    sql += ' AND department = ?';
    params.push(department);
  }
  sql += ' ORDER BY department, id';
  return db.prepare(sql).all(...params);
}

function departments(eventId) {
  return db
    .prepare('SELECT DISTINCT department FROM registrations WHERE event_id = ? ORDER BY department')
    .all(eventId)
    .map((r) => r.department);
}

function summary(eventId) {
  return db
    .prepare(
      `SELECT
         COUNT(*)                                        AS total,
         SUM(checked_in)                                 AS checked_in,
         SUM(CASE WHEN checked_in = 0 THEN 1 ELSE 0 END) AS not_checked_in,
         SUM(CASE WHEN source = 'online' THEN 1 ELSE 0 END) AS online,
         SUM(CASE WHEN source = 'walkin' THEN 1 ELSE 0 END) AS walkin
       FROM registrations WHERE event_id = ?`
    )
    .get(eventId);
}

function summaryByDepartment(eventId) {
  return db
    .prepare(
      `SELECT department,
         COUNT(*)                                        AS total,
         SUM(checked_in)                                 AS checked_in,
         SUM(CASE WHEN checked_in = 0 THEN 1 ELSE 0 END) AS not_checked_in,
         SUM(CASE WHEN source = 'walkin' THEN 1 ELSE 0 END) AS walkin
       FROM registrations WHERE event_id = ?
       GROUP BY department ORDER BY department`
    )
    .all(eventId);
}

module.exports = {
  create,
  findById,
  findByPhone,
  countByEvent,
  search,
  markCheckedIn,
  listByEvent,
  departments,
  summary,
  summaryByDepartment,
};
