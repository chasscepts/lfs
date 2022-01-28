const path = require('path');
const sqlite3 = require('sqlite3');

/**
 * @module sqlite3P
*/

/**
 * A promisefied wrapper around sqlite3.Database
 * @module sqlite3P
 * 
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
   * closes the underlying sqlite3.Database connection
   * @returns {Promise<void>}
   */
  close = () => new Promise((resolve, reject) => {
    this.db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  /**
   * Runs the SQL query with the specified parameters. It does not retrieve any result data.
   * @link https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
   * @param {string} sql query to run
   * @param {Array || Object} param query to run
   * @returns {Promise<sqlite3.Database>}
   */
  run = (sql, param = []) => new Promise((resolve, reject) => {
    this.db.run(sql, param || [], (err) => {
      if (err) reject(err);
      resolve(this);
    });
  });

  /**
   * Runs the SQL query with the specified parameters. The returned Promise resolves to first row of this query or undefined if the result set is empty.
   * @link https://github.com/mapbox/node-sqlite3/wiki/API#databasegetsql-param--callback
   * @param {string} sql query to run
   * @param {Object} param query to run
   * @returns {Promise<sqlite3.Database>}
   */
  get = (sql, param = []) => new Promise((resolve, reject) => {
    this.db.get(sql, param || [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  /**
   * Runs the SQL query with the specified parameters. The returned Promise resolves to all result rows of this query or undefined if the result set is empty.
   * @link https://github.com/mapbox/node-sqlite3/wiki/API#databasegetsql-param--callback
   * @param {string} sql query to run
   * @param {Object} param  (optional): When the SQL statement contains placeholders, you can pass them in here. They will be bound to the statement before it is executed. There are three ways of passing bind parameters: directly in the function's arguments, as an array, and as an object for named parameters. This automatically sanitizes inputs RE: issue #57.
   * @returns {Promise<sqlite3.Database>}
   */
  all = (sql, param) => new Promise((resolve, reject) => {

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
 * @returns {Promise<Database>}
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
