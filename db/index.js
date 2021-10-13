const fs = require('fs');
const path = require('path');
const { node } = require('webpack');
const dir = '/store';

if (fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let db = {};

const file = process.env.NODE_ENV === 'development' ? 'dev.json' : 'db.json';

const dbPath = path.join(dir, file);

if (fs.existsSync(dbPath)) {
  try {
    const temp = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    db = temp;
  } catch {
    console.log('Database may be corrupted! Saving to db will over write current content.');
  }
}

const save = () => fs.writeFileSync(dbPath, JSON.stringify(db));

const find = (key) => {
  if (Object.keys(db).indexOf(key) < 0) {
    throw new Error(`${key} was not found in database!`);
  }
  return db[key];
}

const get = (key) => db[key];

const getAll = () => ({ ...db });

const post = (key, value) => {
  db[key] = value;
  save();
}

const update = (key, value) => {
  db[key] = value;
  save();
}

const destroy = (key) => {
  delete db[key];
  save();
}

module.exports = { find, get, getAll, post, update, delete: destroy };
