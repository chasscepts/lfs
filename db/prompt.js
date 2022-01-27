const readline = require('readline');
const { stdin: input, stdout: output } = process;
const { USER_TERMINATED } = require('./errorCodes');

/**
 * @typedef {Object} SessionOptions
 * @property {string} welcomeMessage
 * @property {string} exitMessage
*/

/**
 * Log to console without trailing newline.
 * @param {string} str
 */
const print = (str) => {
  output.write(str);
};

/**
 * @param {string} prmt
 * @param {function} oninput
 * @param {function} onclose
 * @param {SessionOptions} options 
 */
const session = (prmt, oninput, onclose, options) => {
  /**
   * @type {SessionOptions}
   */
  let ops = options || Object.create(null);
  if (ops.welcomeMessage) {
    console.log(ops.welcomeMessage);
  }
  print(prmt);

  const r1 = readline.createInterface({ input, output });

  const control = {
    nextLine: () => r1.resume(),
    close: () => r1.close(),
  };

  r1.on('SIGINT', () => {
    r1.close();
  });
  r1.on('SIGTSTP', () => {
    r1.close();
  });
  r1.on('line', (line) => {
    oninput(line);
    print(prmt);
  });
  r1.on('close', () => {
    if (ops.exitMessage) {
      console.log(ops.exitMessage);
    }
    if (onclose) {
      onclose();
    }
  });
};

/**
 * Reads a line of text from stdin
 * @param {string} question prompt message
 * @returns {Promise<string>}
 */
const readLine = (question) => new Promise((resolve, reject) => {
  print(`${question} `);
  const r1 = readline.createInterface({ input, output });
  let answer = '';
  let error;

  r1.on('SIGINT', () => {
    const error = new Error('User terminated process before input was received');
    error.code = USER_TERMINATED;
    close();
  });
  r1.on('SIGTSTP', () => {
    const error = new Error('User terminated process before input was received');
    error.code = USER_TERMINATED;
    close();
  });
  r1.on('line', (input) => {
    answer = input;
    r1.close();
  });
  r1.on('close', () => {
    if (error) {
      reject(error);
    } else {
      resolve(answer);
    }
  });
});

module.exports = {
  readLine,
  session,
};
