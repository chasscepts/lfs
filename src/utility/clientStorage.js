/**
 * @typedef Bookmark
 * @property {string} path
 * @property {string} title
*/

const KEYS = {
  bookmark: 'BOOKMARKS',
  user: 'USER',
};

/**
 * @type {Storage}
 */
let storage;

/**
 * @type {Array<Bookmark>}
*/
let bookmarks;

const readObject = (key, defaultValue) => {
  const text = storage.getItem(key);
  if (!text) return defaultValue;
  try {
    return JSON.parse(text);
  } catch {
    return defaultValue;
    storage.removeItem(key);
  }
};

const saveBookmarks = () => storage.setItem(KEYS.bookmark, JSON.stringify(bookmarks));

/**
 * @param {Storage} store 
 */
export const setStorage = (store) => {
  storage = store;
  bookmarks = readObject(KEYS.bookmark, []);
};

setStorage(localStorage);

export const getAllBookmarks = () => [...bookmarks];

export const getBookmark = (path) => bookmarks.find((b) => b.path === path);

export const createBookmark = (path, title) => {
  bookmarks.push({ path, title });
  saveBookmarks();
};

export const updateBookmark = (path, title) => {
  const bookmark = bookmarks.find((bk) => bk.path === path);
  if (!bookmark) return;
  bookmark.title = title;
  saveBookmarks();
};

export const deleteBookmark = (path) => {
  bookmarks = bookmarks.filter((bk) => bk.path !== path);
  saveBookmarks();
};

const getStorage = () => storage;

export default getStorage;
