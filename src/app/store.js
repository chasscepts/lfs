import { configureStore } from '@reduxjs/toolkit';
import directoryReducer from '../reducers/dirSlice';
import filesReducer from '../reducers/filesSlice';
import notificationReducer from '../reducers/notificationSlice';

export const createStore = () => configureStore({
  reducer: {
    dir: directoryReducer,
    files: filesReducer,
    notification: notificationReducer,
  },
});

const store = createStore();

export default store;
