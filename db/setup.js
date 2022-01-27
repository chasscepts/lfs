const bcrypt = require('bcrypt');
const db = require('./database');
const prompt = require('./prompt');
const security = require('./security');
const admin = require('./Admin');
const { USER_TERMINATED, AUTHENTICATION_FAILED } = require('./errorCodes');

const msg = `
Database has ALREADY been setup. 
If you decide to continue with a new setup, you loose ALL THE DATA already in your database.
This process is irreversible.
`;

const createAdminTableMigrationText = 
`const sqlite3 = require('sqlite3');

module.exports = {
  /**
   * @param {sqlite3.Database} db 
   * @returns {Promise<Boolean>} Promise that resolves to true when this migration succeeds and false otherwise.
   */
  run: (db) => new Promise((resolve, reject) => {
    db.run('CREATE TABLE admins (username TEXT, password TEXT)', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  }),
}
`;

const createUserTableMigrationText = 
`const sqlite3 = require('sqlite3');

module.exports = {
  /**
   * @param {sqlite3.Database} db 
   * @returns {Promise<Boolean>} Promise that resolves to true when this migration succeeds and false otherwise.
   */
  run: (db) => new Promise((resolve, reject) => {
    db.run('CREATE TABLE users (username TEXT, password TEXT)', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  }),
}
`;



const setup = () => {
  let username;

  return migrate()
    .then(() => prompt.readLine('Enter Admin Username: '))
    .then((line) => {
      if (!line) throw new Error('Username cannot be empty!');
      username = line;
      return prompt.readLine('Enter Password: ');
    })
    .then((line) => {
      if (!line) throw new Error('Password cannot be empty!');
      return bcrypt.hash(line, security.SALT_ROUNDS);
    })
    .then((hash) => new Promise((resolve, reject) => {
      db.run('INSERT INTO admins (username, password) VALUES (?,?)', [username, hash], (err) => {
        if (err) reject(err);
        else {
          migrate()
            .then(() => resolve())
            .catch((err) => reject(err));
        }
      })
    }))
    .catch((err) => {
      const e = err || new Error();
      const msg = 'Unable to continue with database setup!';
      e.message = e.message ? `${msg}${"\n"}${e.message}` : msg;
      throw e;
    });
};

const run2 = () => new Promise((resolve, reject) => {
  admin.isEmpty()
    .then((empty) => {
      console.log({ empty });
    })
    .catch((err) => reject(err));
});

const run = () => new Promise((resolve, reject) => {
  admin.isEmpty()
    .then((empty) => {
      if (empty) {
        return admin.setup()
          .then(() => admin.promptRegistration())
          .catch((err) => { throw err; })
      };
      console.warn(msg);
      return prompt.readLine('Do you wish to continue? [yes / no]')
        .then((line) => {
          if (!(line === 'y' || line === 'yes')) {
            const error = new Error('User opted not to reset the database!');
            error.code = USER_TERMINATED;
            throw error;
          }
          return admin.promptLogin();
        })
        .catch((err) => {throw err;})
    })
    .then((admin) => {
      if (!admin) {
        const error = new Error('Authentication Failed!');
        error.code = AUTHENTICATION_FAILED;
        throw error;
      }
      resolve();
    })
    .catch((err) => reject(err));
});

module.exports = {
  run,
}
