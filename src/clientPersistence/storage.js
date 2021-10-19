const KEY = 'KEY_VALUE_KEY';

const LAST_DIR_KEY = 'LAST DIR KEY';

let storage;

const saved = localStorage.getItem(KEY);

if (saved) {
  try {
    storage = JSON.parse(saved);
  } catch {
    storage = {};
  }
} else {
  storage = {};
}

const save = () => localStorage.setItem(KEY, JSON.stringify(storage));

const get = (key) => storage[key];

const put = (key, value) => {
  storage[key] = value;
  save();
};

const destory = (key) => {
  delete storage[key];
  save();
}

export default {
  get, put, destory,
  getLastDir: () => get(LAST_DIR_KEY),
  saveLastDir: (dir) => put(LAST_DIR_KEY, dir),
};
