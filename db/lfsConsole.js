const prompt = require('./prompt');

/**
 * @param {string} username
 * @param {string} password
 */
const open = (username, password) => {
  if (!(username.toLowerCase() === 'francis' && password === 'qwerty')) {
    console.error('LFS console: authentication failed.');
    return;
  }
  prompt.session('>>', (cmd) => {

  }, null, {
    welcomeMessage: '..........LFS Console..........\n-----------------------------------',
    exitMessage: 'Exiting LFS console ...',
  });
};


module.exports = {
  open,
}
