const path = require('path');
const sqlite3 = require('sqlite3');

/**
 * @module sqlite3 
*/

/**
 * @type {sqlite3.Database}
 */
class Database {
  /**
   * A promisefied sqlite3 database
   * @param {sqlite3.Database} db 
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * closes the database connection
   * @returns {Promise<void>}
   */
  close = () => new Promise((resolve, reject) => {
    this.db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  /**
   * @param {string} sql query to run
   * @param {Array || Object} param query to run
   * @returns {Promise<sqlite3.Database>}
   */
  run = (sql, param = null) => new Promise((resolve, reject) => {
    this.db.run(sql, param, (err) => {
      if (err) reject(err);
      resolve(this);
    });
  });

  get = (params) => new Promise((resolve, reject) => {
    this.db.get(...params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * @callback Close
 * @returns {Promise<void>}
*/

/**
 * @typedef {Object} Database
 * @property {Close} close closes the database connection
*/

const PATH = path.join(process.cwd(), 'db', 'database', './lfs.db');

/**
 * opens a connection to the application database.
 * @returns {Promise<sqlite.Database>}
 */
const connect = () => new Promise((res, rej) => {
  const db = new sqlite3.Database(PATH, (e) => {
    if (err) {
      rej(e);
      return;
    }

    res(new Database(db));
  });
});

connect().then((db) => db.close())

module.exports = { connect, };
