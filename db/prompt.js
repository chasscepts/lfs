const readline = require('readline');
const { stdin: input, stdout: output } = process;

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
  r1.on('line', (input) => {
    r1.pause();
    oninput(input);
    r1.resume();
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
    error = { code: 1, message: 'User terminated process before input was received' };
    close();
  });
  r1.on('SIGTSTP', () => {
    error = { code: 1, message: 'User terminated process before input was received' };
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
