const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const db = require('./database');

const PATH = path.join(process.cwd(), 'db', '__migrations');

const MIGRATION_SEED =
`const sqlite3 = require('sqlite3');

module.exports = {
  /**
   * @param {sqlite3.Database} db 
   * @returns {Promise<Boolean>} Promise that resolves to true when this migration succeeds and false otherwise.
   */
  run: (db) => new Promise((resolve, reject) => {

  }),
}
`;

const TABLE = '__MIGRATIONS__';

if (!fs.existsSync(PATH)) {
  fs.mkdirSync(PATH);
}

const createFile = (name, seed) => new Promise((resolve, reject) => {
  const lName = `${name}_${uuid.v4()}.js`;
  const file = path.join(PATH, lName);
  fs.writeFile(file, seed || MIGRATION_SEED, (err) => {
    if (err) reject(err);
    else resolve(file);
  });
});

/**
 * @param {number} index current index into migrations
 * @param {string[]} migrations ids of migrations
 */
const runSingle = (index, migrations, resolve, reject) => {
  if (index >= migrations.length) return;
  const msg = 'One or more migrations failed to run.';
  const id = migrations[index];
  db.get(`SELECT * FROM ${TABLE} WHERE id=$id`, {
    $id: id,
  }, (err2, row) => {
    if (err2) {
      err2.message = err2.message ? `${msg}\n${err2.message}` : msg;
      reject(err2);
      return;
    }
    if (!row) {
      const migration = require(path.join(PATH), id);
      migration.run()
        .then((b) => {
          if (b) {
            db.run(`INSERT INTO ${TABLE} (id) VALUES (?)`,[id], (err) => {
              if (err) {
                err.message = err.message ? `${msg}\n${err.message}` : msg;
                reject(err);
                return;
              }
            });
          } else {
            reject({ message: msg });
            return;
          }
          runSingle(index + 1, migration);
        })
        .catch((err) => {
          throw err;
        });
    }
  });
}

const drop = () => new Promise((resolve, reject) => {
  try {
    db.run(`DROP TABLE ${TABLE}`, (err) => {
      if (err) reject (err);
      else resolve();
    });
  } catch (err) {
    reject (err);
  }
});

const run = () => new Promise((resolve, reject) => {
  db.run(`CREATE TABLE IF NOT EXISTS ${TABLE} (id TEXT)`, (err) => {
    if (err) {
      reject(err);
    }

    const files = fs.readdirSync(PATH, { encoding: 'utf-8' }).map((f) => f.split('_').pop());

    runSingle(0, files, resolve, reject);
  });
});

module.exports = {
  PATH,
  new: createFile,
  run,
  drop,
}
