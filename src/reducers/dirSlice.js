import { createSlice } from '@reduxjs/toolkit';
import api from '../api';

/* eslint-disable no-param-reassign */

const slice = createSlice({
  name: 'dir',
  initialState: {
    directories: [],
    currentDir: null,
    loading: false,
    error: null,
    root,
  },
  reducers: {
    setCurrentDir: (state, { payload: { directory, fromState } }) => {
      state.currentDir = directory;
      state.error = null;
      state.loading = false;
      if (!fromState) {
        state.directories.push(directory);
      }
    },
    setLoading: (state) => {
      state.loading = true;
    },
    setError: (state, { payload }) => {
      state.error = payload,
      state.loading = false;
    },
    setRoot: (state, { payload }) => {
      state.root = payload;
    },
  },
});

/* eslint-enable no-param-reassign */

export const {
  setCurrentDir,
  setLoading,
  setError,
  setRoot,
} = slice.actions;

export const selectCurrentDir = (state) => state.dir.currentDir;

export const selectDirectoryLoading = (state) => state.dir.loading;

export const selectDirectoryError = (state) => state.dir.error;

export const selectRootDirectory = (state) => state.dir.root;

export const loadDirAsync = (path) => (dispatch, getState) => {
  let isRoot = true;
  if (path) {
    const directory = getState().dir.directories.find((dir) => dir.path === path);
    if (dir) {
      dispatch(setCurrentDir({ directory, fromState: true }));
      return;
    }
    isRoot = false;
  }
  dispatch(setLoading());
  api.listDir(path)
    .then((directory) => {
      dispatch(setCurrentDir({ directory, fromState: false }));
      if (isRoot) {
        dispatch(setRoot(directory.path));
      }
    })
    .catch((err) => {
      dispatch(setError({ directory: path || '', originalError: err }));
    })
};

export default slice.reducer;
