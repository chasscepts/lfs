const db = require('./database');

const table = 'users';

/**
 * create a new user
 * @param {string} username
 * @param {string} password 
 */
const create = (username, password) => new Promise((resolve, reject) => {
  db.run(`INSERT INTO ${table} (username, password) VALUES (?, ?)`, [username, password], (err) => {
    if (err) reject(err);
    resolve();
  });
});

module.exports = {
  create,
};
