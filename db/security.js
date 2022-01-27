const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const hash = (password) => bcrypt.hash(password, SALT_ROUNDS);

module.exports = {
  SALT_ROUNDS,
  hash,
};
