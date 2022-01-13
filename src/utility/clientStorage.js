/**
 * @typedef Bookmark
 * @property {string} path
 * @property {string} title
*/

import { path } from "express/lib/application";

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

export const saveBookmark = (path, title) => {
  bookmarks.push({ path, title });
};

export const updateBookmark = (path, title) => saveBookmark(path, title);

const getStorage = () => storage;

export default getStorage;
