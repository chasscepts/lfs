import { createSlice } from '@reduxjs/toolkit';

let id = 0;

const slice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
  },
  reducers: {
    push: (state, { payload }) => {
      id += 1;
      state.notifications.push({ ...payload, id });
    },
    pop: (state, { payload }) => {
      state.notifications = state.notifications.filter((note) => note.id !== payload);
    },
  },
});

export const {
  push: pushNotification,
  pop: popNotification,
} = slice.actions;

export const selectNotifications = (state) => state.notification.notifications;

export default slice.reducer;
