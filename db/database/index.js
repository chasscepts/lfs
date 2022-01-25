const sqlite3 = require('sqlite3');

const PATH = './lfs.db';

const db = new sqlite3.Database(PATH, (err) => {
  console.error(err);
});

db.on('error', (err) => {
  console.log(err);
});

module.exports = db;
