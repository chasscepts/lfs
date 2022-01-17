import { createSlice } from '@reduxjs/toolkit';
import api from '../api';
import { pushNotification } from './notificationSlice';
import storage from '../clientPersistence/storage';

const slice = createSlice({
  name: 'dir',
  initialState: {
    directories: [],
    currentDir: null,
    loading: false,
    error: null,
    rootDir: null,
    activePath: null,
  },
  reducers: {
    setCurrentDir: (state, { payload: { directory, fromState } }) => {
      state.currentDir = directory;
      state.error = null;
      state.loading = false;
      if (!state.rootDir) {
        state.rootDir = directory;
      }
      if (!fromState) {
        state.directories.push(directory);
      }
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload,
      state.loading = false;
    },
    addFile: (state, { payload }) => {
      const dir = state.directories.find((dir) => dir.path === payload.parent);
      if (!dir) {
        state.loading = false;
        return;
      }
      dir.children.push(payload);
      const currentDir = state.currentDir;
      if (currentDir && currentDir.path === payload.parent) {
        currentDir.children.push(payload);
      }
      state.loading = false;
    },
    setActivePath: (state, { payload }) => {
      state.activePath = payload;
    },
  },
});

export const {
  setCurrentDir,
  setLoading,
  setError,
  addFile,
  setActivePath,
} = slice.actions;

export const selectCurrentDir = (state) => state.dir.currentDir;

export const selectDirectoryLoading = (state) => state.dir.loading;

export const selectDirectoryError = (state) => state.dir.error;

export const selectRootDirectory = (state) => state.dir.rootDir;

export const selectActivePath = (state) => state.dir.activePath;

export const loadDirAsync = (path) => (dispatch, getState) => {
  if (getState().dir.loading) return;
  let dir = path;
  if (path) {
    const directory = getState().dir.directories.find((dir) => dir.path === path);
    if (directory) {
      dispatch(setCurrentDir({ directory, fromState: true }));
      storage.saveLastDir(path);
      return;
    }
  } else {
    dir = storage.getLastDir();
  }
  dispatch(setLoading(true));
  api.listDir(dir)
    .then((directory) => {
      dispatch(setCurrentDir({ directory, fromState: false }));
      if (path) {
        storage.saveLastDir(path);
      }
    })
    .catch((err) => {
      dispatch(setError({ path: dir || '', originalError: err }));
    })
};

export const uploadFileAsync = (data) => (dispatch) => {
  dispatch(setLoading(true));
  api.upload('/upload', data)
    .then((res) => res.json())
    .then((file) => dispatch(addFile(file)))
    .catch((err) => {
      dispatch(setLoading(false));
      dispatch(pushNotification({ type: 'error', message: err.message || 'Unknown error occurred during file upload' }));
    });
};

export const createDirAsync = (name, path) => (dispatch) => {
  dispatch(setLoading(true));
  api.createDir(name, path)
    .then((directory) => dispatch(addFile(directory)))
    .catch((err) => {
      dispatch(pushNotification(`Unable to create directory: ${err.message}`));
      dispatch(setLoading(false));
    });
};

export default slice.reducer;
