const db = require('../db/connection');

function create({ name, eventTime, location, capacity, createdAt }) {
  const info = db
    .prepare('INSERT INTO events (name, event_time, location, capacity, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(name, eventTime, location, capacity, createdAt);
  return Number(info.lastInsertRowid);
}

function findAll() {
  return db.prepare('SELECT * FROM events ORDER BY event_time DESC, id DESC').all();
}

function findById(id) {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id);
}

module.exports = { create, findAll, findById };
