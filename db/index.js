const arg = require('arg');
const inquire = require('inquirer');
const lfsConsole = require('./lfsConsole');
const setup = require('./setup');
const migration = require('./migration');
const prompt = require('./prompt');
const User = require('./User');

const argv = process.argv.slice(2);

console.log('.......... LFS DATABASE ..........');

const openConsole = (withPrompts = false) => {
  const usernameTag = '--username';
  const passwordTag = '--password';
  let args;
  let confirm = false;
  if (withPrompts) {
    args = {};
    confirm = true;
  } else {
    try {
      args = arg({
        [usernameTag]: String,
        [passwordTag]: String,
        '-n': usernameTag,
        '-p': passwordTag,
      },  { argv });
    } catch {
      console.log('Unknown args passed to cmd. Please consult the documentation for correct usage.');
      process.exit(-1);
    }
  }
  let username = args[usernameTag];
  let password = args[passwordTag];
  let questions = [];
  if (!username) {
    questions.push({
      name: 'username',
      message: 'Enter username',
    });
  }
  if (!password) {
    questions.push({
      type: 'password',
      name: 'password',
      message: 'Enter password',
    });
  }

  if (questions.length) {
    inquire.prompt(questions)
    .then((answers) => {
      if (answers.username) {
        username = answers.username;
      }
      if (answers.password) {
        password = answers.password;
      }
      if (!username) {
        console.log('Username not provided!. Exiting LFS Console ...');
        return;
      }
      if (!password) {
        console.log('Password not provided!. Exiting LFS Console ...');
        return;
      }
      lfsConsole.open(username, password);
    })
    .catch((err) => {
      console.trace(err);
    });
  } else {
    lfsConsole.open(username, password);
  }
};

const createUser = (withPrompts = false) => {
  const usernameTag = '--username';
  const passwordTag = '--password';
  let args;
  let confirm = false;
  if (withPrompts) {
    args = {};
    confirm = true;
  } else {
    try {
      args = arg({
        [usernameTag]: String,
        [passwordTag]: String,
        '-n': usernameTag,
        '-p': passwordTag,
      },  { argv });
    } catch {
      console.log('Unknown args passed to cmd. Please consult the documentation for correct usage.');
      process.exit(-1);
    }
  }
  let username = args[usernameTag];
  let password = args[passwordTag];
  let questions = [];
  if (!username) {
    questions.push({
      name: 'username',
      message: 'Enter username',
    });
  }
  if (!password) {
    questions.push({
      type: 'password',
      name: 'password',
      message: 'Enter password',
    });
    questions.push({
      type: 'password',
      name: 'confirmPassword',
      message: 'Confirm password',
    });
  }

  if (questions.length) {
    inquire.prompt(questions)
    .then((answers) => {
      if (answers.username) {
        username = answers.username;
      }
      if (answers.password) {
        password = answers.password;
      }
      if (!username) {
        console.log('Username not provided!. Exiting LFS ...');
        return;
      }
      if (!password) {
        console.log('Password not provided!. Exiting LFS ...');
        return;
      }
      if (password !== answers.confirmPassword) {
        console.log('Provided passwords do not match!. Exiting LFS ...');
        return;
      }
      User.create(username, password);
    })
    .catch((err) => {
      console.trace(err);
    });
  } else {
    User.create(username, password);
  }
};

const sanitizeFilename = (name) => {
  if (!name) return '';
  return name;
}

const generateMigration = (name) => {
  migration.run();
  return;
  let nName = name;
  if (!nName) {
    prompt.readLine('Enter migration name')
      .then((line) => {
        nName = sanitizeFilename(line);
        if (nName) {
          generateMigration(nName);
        } else {
          console.error('Migration name MUST NOT be empty or contain INVALID path characters!');
        }
      })
      .catch((err) => console.error(err));
  } else {
    migration.new(nName)
      .then((file) => console.log(`Generated migration path - ${file}`))
      .catch((err) => console.error(err));
  }
};

const setupAdmin = () => {
  setup.run()
    .then(() => console.log('LFS admin setup completed'))
    .catch((err) => console.error(err));
};

const args = arg({}, { argv, permissive: true });

const commands = args._.map((c) => c.toLowerCase());

let handled = false;

if (commands[0] === 'new') {
  switch (commands[1]) {
    case 'user':
      createUser();
      break;
    case 'migration':
      const name = sanitizeFilename(commands[2]);
      if (!name) {
        console.error(`Please provide a descriptive name for migration. ${!commands[2]? 'empty string' : commands[2]} is not a valid migration name`);
      } else {
        generateMigration(name);
      }
      break;
    default:
      console.error(`${commands[1] || 'undefined'} is not a valid new command parameter!`);
      break;
  }
  handled = true;
} else if (commands[0] === 'admin') {
  switch (commands[1]) {
    case 'setup':
      setupAdmin();
      break;
    default:
      const errorMessage = commands[2] ? `Unknow Admin command - ${commands[2]}` : 'Admin setup requires a second, argument but none received!';
        console.error(errorMessage);
      break;
  }
  handled = true;
}
else if (commands[0] === 'console') {
  openConsole();
  handled = true;
}

if (!handled) {
  inquire.prompt([{
    name: 'command',
    message: 'Please enter command id',
  }])
  .then((answers) => {
    switch(answers.command) {
      case 'new user':
        createUser(true);
        break;
      case 'new migration':
        generateMigration();
        break;
      case 'console':
        openConsole(true);
        break;
      default:
        console.log('Unknown command provided. Exiting LFS ...');
    }
  })
  .catch((err) => {
    console.trace(err);
  });
}
