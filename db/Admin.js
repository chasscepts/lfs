const bcrypt = require('bcrypt');
const db = require('./database');
const prompt = require('./prompt');
const security = require('./security');
const { ADMIN_EXISTS, PASSWORD_MISMATCH } = require('./errorCodes');

const TABLE = 'admins';

/**
 * Checks if Admin table exists and has at least one admin
 * @returns {Promise<boolean>}
 */
const isEmpty = () => new Promise((resolve, reject) => {
  db.get(`SELECT count(*) FROM sqlite_master WHERE type="table" AND name="${TABLE}";`, (err, row) => {
    if (err) {
      reject(err);
      return;
    };
    if (!(row && row['count(*)'])) {
      resolve(true);
      return;
    }
    db.all(`SELECT username from ${TABLE}`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(!(rows && rows.length));
      }
    });
  });
});

/**
 * Creates the admins table if it does not exist
 * @returns {Promise<void>}
 */
const setup = () => new Promise((resolve, reject) => {
  db.run(`CREATE TABLE IF NOT EXISTS ${TABLE}(username TEXT, password TEXT)`, (err) => {
    if (err) reject(err)
    else resolve();
  });
});

/**
 * @param {string} username admin username
 * @param {string} password admin password
 * @returns {Promise<{username: string} | false>}
 */
const authenticate = (username, password) => new Promise((resolve, reject) => {
    db.get('SELECT password FROM admins WHERE username=$name', { $name: username }, (err, row) => {
      if (err) reject(err);
      if (!row) {
        resolve(false);
        return;
      }
      bcrypt.compare(password, row.password)
        .then((eq) => {
          if (eq) {
            resolve({ username });
          } else {
            resolve(false);
          }
        })
        .catch((err) => reject(err));
    });
});

/**
 * creates a new admin. If an admin with same username already exists, an Error is thrown.
 * @param {string} username admin username
 * @param {string} password admin password
 * @returns {Promise<{username:string} | boolean>}
 */
const create = (username, password) => new Promise((resolve, reject) => {
  db.get(`SELECT username FROM ${TABLE} WHERE username=$name`, {$name: username}, (err, row) => {
    if (err) {
      reject(err);
      return;
    }
    if (row) {
      const error = new Error('Admin with given username already exists!');
      error.code = ADMIN_EXISTS;
      reject(error);
      return;
    }
    security.hash(password)
      .then((hash) => {
        db.run(
          `INSERT INTO ${TABLE} (username, password) VALUES ($name, $pass)`,
          { $name: username, $pass: hash },
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve({ username });
          }
        );
      })
      .catch((err) => reject(err));
  });
});

/**
 * prompts a users to enter username and password, and attempts to authenticate them.
 * @returns {Promise<{username: string} | false>}
 */
const promptLogin = () => new Promise((resolve, reject) => {
  console.log('Please login to proceed.');
  let username;
  prompt.readLine('Enter Username: ')
    .then((line) => {
      username = line;
      return prompt.readLine('Enter Password: ')
    })
    .then((password) => authenticate(username, password))
    .then((admin) => resolve(admin))
    .catch((err) => reject(err));
});

/**
 * prompts a users to enter username and password, and attempts to create a new account.
 * If an account with user supplied username already exists an error is thrown.
 * @returns {Promise<{username: string} | false>}
 */
 const promptRegistration = () => new Promise((resolve, reject) => {
  let username;
  let password;
  console.log('......... LFS - new Admin registration ...........');
  prompt.readLine('Enter new username: ')
    .then((line) => {
      username = line;
      return prompt.readLine('Enter new password: ')
    })
    .then((line) => {
      password = line;
      return prompt.readLine('Repeat Password: ')
    })
    .then((line) => {
      if (line !== password) {
        const error = new Error('Password do not match!');
        error.code = PASSWORD_MISMATCH;
        throw error;
      }
      return create(username, password);
    })
    .then((admin) => resolve(admin))
    .catch((err) => reject(err));
});

module.exports = {
  TABLE,
  isEmpty,
  setup,
  authenticate,
  create,
  promptLogin,
  promptRegistration,
}
