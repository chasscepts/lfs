import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'bookmark',
  initialState: {
    bookmarks: null,
  },
  reducers: {
    setBookmarks: (state, { payload }) => {
      state.bookmarks = payload;
    },
  },
});

export const {
  setBookmarks,
} = slice.actions;

export const selectBookmarks = (state) => state.bookmark.bookmarks;

export default slice.reducer;
