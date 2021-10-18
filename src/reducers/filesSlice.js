import { createSlice } from '@reduxjs/toolkit';
import api from '../api';

let id = 0;

const slice = createSlice({
  name: 'files',
  initialState: {
    downloads: [],
    uploads: [],
    isUploadFormOpen: false,
    uploadFormState: { open: false, clickFile: false, filename: '' },
    activeFile: null,
    activeFileContent: null,
    activeContentError: null,
    viewerLoading: false,
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
    openUploadForm: (state, { payload }) => {
      state.isUploadFormOpen = payload;
    },
    updateUploadFormState: (state, { payload }) => {
      state.uploadFormState = { ...state.uploadFormState, ...payload };
    },
    setActiveFile: (state, { payload }) => {
      if (state.activeFile && payload && state.activeFile.path !== payload.path) {
        state.activeFileContent = null;
        state.activeContentError = null;
      }
      state.activeFile = payload;
      if (!payload) {
        state.activeFileContent = null;
        state.activeContentError = null;
      }
    },
    setActiveFileContent: (state, { payload }) => {
      state.activeFileContent = payload;
      state.activeContentError = null;
      state.viewerLoading = false;
    },
    setActiveContentError: (state, { payload }) => {
      state.activeFileContent = null;
      state.activeContentError = payload;
      state.viewerLoading = false;
    },
    setViewerLoading: (state, { payload }) => {
      state.viewerLoading = payload;
    },
  },
});

export const {
  pushDownload,
  popDownload,
  pushUpload,
  popUpload,
  openUploadForm,
  updateUploadFormState,
  setActiveFile,
  setActiveFileContent,
  setActiveContentError,
  setViewerLoading,
} = slice.actions;

export const downloadFileAsync = (path) => (dispatch) => {
  const jobId = `${id}`;
  id += 1;
  dispatch(pushDownload({ id: jobId, path }));
  api.downloadFile(path)
    .then(() => dispatch(popDownload(id)))
    .catch((err) => console.log(err));
};

export const loadFileContentAsync = (path, type) => (dispatch) => {
  dispatch(setViewerLoading(true));
  api.getFileContent(path, type)
    .then((content) => dispatch(setActiveFileContent(content)))
    .catch((err) => dispatch(setActiveContentError(err)));
}

export const selectIsUploadFormOpen = (state) => state.files.isUploadFormOpen;
export const selectUploadFormState = (state) => state.files.uploadFormState;
export const selectActiveFile = (state) => state.files.activeFile;
export const selectActiveFileContent = (state) => state.files.activeFileContent;
export const selectActiveContentError = (state) => state.files.activeContentError;
export const selectViewerLoading = (state) => state.files.viewerLoading;

export default slice.reducer;
