const path = require('path');
const { cwd } = require('process');
const sqlite3 = require('sqlite3');

const PATH = path.join(process.cwd(), 'db', 'database', './lfs.db');

const db = new sqlite3.Database(PATH, (err) => {
  console.error(err);
});

db.on('error', (err) => {
  console.log(err);
});

module.exports = db;
