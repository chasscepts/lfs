const fs = require('fs');
const express = require('express');
const path = require('path');
const db = require('../db');
const callable = require('../utils/callable');
const multer = require('multer');

const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/** @type string */
let uploads;
/** @type string */
let downloads;
let root = db.get('root');
if (root) {
  const uploads = createDir(path.join(root, 'uploads'));
  const downloads = createDir(path.join(root, 'downloads'));
} else {
  uploads = createDir(path.join(process.cwd(), 'user-files', 'uploads'));
  const platform = callable(process.platform) ? process.platform() : process.platform;
  downloads = path.resolve('/'); // platform === 'win32' ? process.cwd().split(path.sep)[0] : '/';
}

/**
 * 
 * @param {string} name file or folder name
 * @param {string} parent parent directory. null if root.
 * @returns 
 */
const get = (name, parent = null) => {
  const file = parent ? path.join(parent, name) : downloads;
  if (!(fs.existsSync(file))) return { type: 'unknown', path: '', children: [] };
  const stat = fs.statSync(file);
  if (stat.isFile()) {
    return {
      type: 'file',
      path: file,
      size: stat.size,
      parent,
      children: [],
    };
  }
  const children = fs.readdirSync(file, { encoding: 'utf-8' }).reduce((accm, child) => {
    try {
      const stat = fs.statSync(path.join(file, child));
      accm.push({
        name: child,
        parent: file,
        path: path.join(file, child),
        size: stat.size,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
      });
    } catch {}
    return accm;
  }, []).filter((file) => file.isDirectory || file.isFile);

  return { type: 'directory', path: file, children };
};

const list = (dir) => {
  let file = dir;
  let shortPath;
  if (!file) {
    file = downloads;
    shortPath = 'root';
  } else {
    const parts = dir.split(downloads).filter(Boolean);
    parts.unshift('root');
    shortPath = parts.join(path.sep);
  }
  if (!(fs.existsSync(file))) {
    return Promise.reject('Directory does not exist');
  };
  const children = fs.readdirSync(file, { encoding: 'utf-8' }).reduce((accm, child) => {
    try {
      const stat = fs.statSync(path.join(file, child));
      accm.push({
        name: child,
        parent: file,
        path: path.join(file, child),
        size: stat.size,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        sep: path.sep,
      });
    } catch {}
    return accm;
  }, []).filter((file) => file.isDirectory || file.isFile).sort((a, b) => {
    if (a.isDirectory && b.isFile) return -1;
    if (b.isDirectory && a.isFile) return 1;
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  return Promise.resolve({ root: downloads, path: file, sep: path.sep, shortPath, children });
};

const createFolder = (name, parent) => {
  const dir = path.join(parent, name);
  if (fs.existsSync(dir)) {
    return Promise.reject({ message: 'Directory already exists' });
  }
  try {
    fs.mkdirSync(dir, { recursive: true });
    return Promise.resolve({
      name,
      parent,
      path: dir,
      size: 0,
      isFile: false,
      isDirectory: true,
    });
  } catch(err) {
    console.log(err);
    return Promise.reject({ message: 'You may not have the rights to create folder in the specified path' });
  }
};

module.exports = {
  get,
  list,
  createFolder,
};
