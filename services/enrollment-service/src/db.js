const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'enrollments.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrolled_at TEXT NOT NULL,
        UNIQUE(student_id, course_id)
      )
    `);

    const now = new Date().toISOString();
    const defaultEnrollments = [
      [2, 1, now],
      [3, 2, now],
    ];

    const seedSql = 'INSERT OR IGNORE INTO enrollments (student_id, course_id, enrolled_at) VALUES (?, ?, ?)';
    defaultEnrollments.forEach((enrollment) => {
      db.run(seedSql, enrollment);
    });
  });
};

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

module.exports = { initDb, run, get, all };
