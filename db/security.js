const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const hash = (password) => new Promise((resolve, reject) => {
  bcrypt.hash(password, SALT_ROUNDS, )
});

module.exports = {
  SALT_ROUNDS,
}
