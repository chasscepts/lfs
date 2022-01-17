import { createSlice } from '@reduxjs/toolkit';
import api from '../api';
import { pushNotification } from './notificationSlice';

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
    useHexa: false,
    withViewerChooser: false,
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
      if (state.activeFile && payload && state.activeFile.path !== payload.file.path) {
        state.activeFileContent = null;
        state.activeContentError = null;
        state.withViewerChooser = false;
      }
      if (payload) {
        state.activeFile = payload.file;
        state.withViewerChooser = payload.withViewerChooser;
      } else {
        state.activeFileContent = null;
        state.activeContentError = null;
        state.useHexa = false;
        state.activeFile = null;
        state.withViewerChooser = false;
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
    setUseHexa: (state, { payload }) => {
      state.useHexa = payload;
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
  setUseHexa,
} = slice.actions;

export const downloadFileAsync = (path, name) => (dispatch) => {
  const jobId = `${id}`;
  id += 1;
  dispatch(pushDownload({ id: jobId, name, path }));
  api.downloadFile(path, name, jobId)
    .then(() => dispatch(popDownload(jobId)))
    .catch((err) => {
      dispatch(popDownload(jobId))
      dispatch(pushNotification({ type: 'error', message: err.message || `Downloading of path ${path} failed for unknown reasons` }));
    });
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
export const selectWithViewerChooser = (state) => state.files.withViewerChooser;
export const selectDownloads = (state) => state.files.downloads;
export const selectUseHexa = (state) => state.files.useHexa;

export default slice.reducer;
