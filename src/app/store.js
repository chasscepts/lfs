import { configureStore } from '@reduxjs/toolkit';
import directoryReducer from '../reducers/dirSlice';
import filesReducer from '../reducers/filesSlice';
import notificationReducer from '../reducers/notificationSlice';
import drawerReducer from '../reducers/drawerSlice';
import bookmarkReducer from '../reducers/bookmarkSlice';
import userReducer from '../reducers/userSlice';

export const createStore = () => configureStore({
  reducer: {
    dir: directoryReducer,
    files: filesReducer,
    notification: notificationReducer,
    drawer: drawerReducer,
    bookmark: bookmarkReducer,
    user: userReducer,
  },
});

const store = createStore();

export default store;
