import { configureStore } from '@reduxjs/toolkit';
import directoryReducer from '../reducers/dirSlice';

export const createStore = () => configureStore({
  reducer: {
    dir: directoryReducer,
  },
});

const store = createStore();

export default store;
