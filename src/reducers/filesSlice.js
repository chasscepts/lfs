import { createSlice } from '@reduxjs/toolkit';
import api from '../api';

let id = 0;

const slice = createSlice({
  name: 'files',
  initialState: {
    downloads: [],
    uploads: [],
  },
  reducers: {
    pushDownload: (state, { payload }) => {
      state.downloads.push(payload);
    },
    popDownload: (state, { payload }) => {
      state.downloads = state.downloads.filter((download) => download.id !== payload);
    },
    pushUpload: (state, { payload }) => {
      state.uploads.push(payload);
    },
    popUpload: (state, { payload }) => {
      state.uploads = state.uploads.filter((upload) => upload.id !== payload);
    },
  },
});

export const {
  pushDownload,
  popDownload,
  pushUpload,
  popUpload,
} = slice.actions;

export const downloadFileAsync = (path) => (dispatch) => {
  const jobId = `${id}`;
  id += 1;
  dispatch(pushDownload({ id: jobId, path }));
  api.downloadFile(path)
    .then(() => dispatch(popDownload(id)))
    .catch((err) => console.log(err));
};

export default slice.reducer;
