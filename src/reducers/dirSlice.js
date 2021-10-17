import { createSlice } from '@reduxjs/toolkit';
import api from '../api';
import { push } from './notificationSlice';

const slice = createSlice({
  name: 'dir',
  initialState: {
    directories: [],
    currentDir: null,
    loading: false,
    error: null,
    rootDir: null,
  },
  reducers: {
    setCurrentDir: (state, { payload: { directory, fromState } }) => {
      state.currentDir = directory;
      state.error = null;
      state.loading = false;
      if (!state.rootDir) {
        state.rootDir = directory;
      } else if (!fromState) {
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
      if (!dir) return;
      dir.children.push(payload);
      const currentDir = state.currentDir;
      if (currentDir && currentDir.path === payload.parent) {
        currentDir.children.push(payload);
      }
      state.loading = false;
    },
  },
});

export const {
  setCurrentDir,
  setLoading,
  setError,
  addFile,
} = slice.actions;

export const selectCurrentDir = (state) => state.dir.currentDir;

export const selectDirectoryLoading = (state) => state.dir.loading;

export const selectDirectoryError = (state) => state.dir.error;

export const selectRootDirectory = (state) => state.dir.rootDir;

export const loadDirAsync = (path) => (dispatch, getState) => {
  if (getState().dir.loading) return;
  if (path) {
    const directory = getState().dir.directories.find((dir) => dir.path === path);
    if (directory) {
      dispatch(setCurrentDir({ directory, fromState: true }));
      return;
    }
  }
  dispatch(setLoading(true));
  api.listDir(path)
    .then((directory) => {
      dispatch(setCurrentDir({ directory, fromState: false }));
    })
    .catch((err) => {
      dispatch(setError({ path: path || '', originalError: err }));
    })
};

export const uploadFileAsync = (data) => (dispatch) => {
  dispatch(setLoading(true));
  api.upload('/upload', data)
    .then((file) => dispatch(addFile(file)))
    .catch((err) => {
      dispatch(setLoading(false));
      dispatch(push({ type: 'error', message: err.message || 'Unknown error occurred during file upload' }));
    });
};

export default slice.reducer;
