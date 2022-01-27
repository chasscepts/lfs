const prompt = require('./prompt');
const admin = require('./Admin');
const { AUTHENTICATION_FAILED } = require('./errorCodes');

const open = () => {
  let username;
  let password;
  prompt.readLine('Enter username: ')
    .then((line) => {
      username = line;
      return prompt.readLine('Enter password: ');
    })
    .then((password) => admin.authenticate(username, password))
    .then((admin) => {
      if (!admin) {
        const error = 'Authentication Failed!';
        error.code = AUTHENTICATION_FAILED;
        throw error;
      }
      prompt.session('>> ', (line) => {
        
      }, null,
      {
        welcomeMessage: 'LFS - DB Console',
        exitMessage: 'Exiting DB console ...',
      })
    })
    .catch((err) => console.error(err));
};

module.exports = {
  open,
};
