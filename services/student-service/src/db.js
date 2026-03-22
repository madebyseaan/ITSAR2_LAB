const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'students.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      )
    `);

    const now = new Date().toISOString();
    const defaultStudents = [
      ['Mariene Labrador', 'mariene.labrador.bsit3b@example.com', now],
      ['Sophia Christi Garcia', 'sophia.garcia.bsit3b@example.com', now],
      ['Kate Nicole Bermejo', 'kate.bermejo.bsit3b@example.com', now],
      ['Carla Andura', 'carla.andura.bsit3b@example.com', now],
    ];

    const seedSql = 'INSERT OR IGNORE INTO students (full_name, email, created_at) VALUES (?, ?, ?)';
    defaultStudents.forEach((student) => {
      db.run(seedSql, student);
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
