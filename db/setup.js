const bcrypt = require('bcrypt');
const db = require('./database');
const prompt = require('./prompt');
const security = require('./security');

const msg = `
Database has ALREADY been setup. 
If you decide to continue with a new setup, you loose ALL THE DATA already in your database.
This process is irreversible.
Do you wish to continue? [yes / no]
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

const migrate = () => new Promise((resolve, reject) => {

})

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

const getAllAdmins = () => {

}

const run = () => {
  if (db === null) return setup();

  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM admins', (err, rows) => {
      if (err) {
        reject(err);
      }
      if (rows.length > 0) {
        let username;
        let password;
        prompt.readLine(msg)
          .then((line) => {
            if (!(line === 'y' || line === 'yes')) {
              throw {};
            }
            return prompt.readLine('Enter username: ');
          })
          .then((line) => {
            username = line;
            return prompt.readLine('Enter passord: ');
          })
          .then((line) => {
            password = line;
            return new Promise((resolve, reject) => {
              db.get(
                'SELECT password FROM admins WHERE username=$name',
                { $name: username }, (err, admin) => {
                  if (err) reject(err);
                  else if (admin) resolve(admin.password);
                  else reject({ localMessage: 'Incorrect username or password' });
                });
            });
          })
          .then((hash) => bcrypt.compare(password, hash))
          .then((eq) => {
            if (eq) {
              setup()
                .then(() => resolve())
                .catch((err1) => reject(err1));
            }
            else reject({ localMessage: 'Incorrect username or password' });
          })
          .catch ((err1) => reject(err1));
      }
      else {
        setup()
          .then(() => resolve())
          .catch((err1) => reject(err1));
      }
    });
  });
};

module.exports = {
  run,
}
