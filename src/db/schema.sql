-- 活动表：时间统一存本地时间字符串 'YYYY-MM-DD HH:MM'，不做时区换算
CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  event_time TEXT    NOT NULL,
  location   TEXT    NOT NULL,
  capacity   INTEGER NOT NULL CHECK (capacity > 0),
  created_at TEXT    NOT NULL
);

-- 报名/签到表：UNIQUE(event_id, phone) 是防重复报名和签到幂等的地基
CREATE TABLE IF NOT EXISTS registrations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,
  phone         TEXT    NOT NULL,
  department    TEXT    NOT NULL DEFAULT '',
  source        TEXT    NOT NULL CHECK (source IN ('online', 'walkin')),
  checked_in    INTEGER NOT NULL DEFAULT 0,
  checked_in_at TEXT,
  created_at    TEXT    NOT NULL,
  UNIQUE (event_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations (event_id);
