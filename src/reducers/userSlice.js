import { createSlice, current } from '@reduxjs/toolkit';
import api from '../api';

const slice = createSlice({
  name: 'user',
  initialState: {
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, { payload }) => {
      state.current = payload.user;
      state.loading = payload.loading;
      state.error = null;
    },
    setError: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
  },
});

const { setUser, setError } = slice.actions;

export const selectUser = (state) => state.user.current;

export const selectUserLoading = (state) => state.user.loading;

export const selectLoginError = (state) => state.user.error;

export const loginAsync = (name, pass) => (dispatch) => {
  dispatch(setUser({ user: null, loading: true }));
  api.login(name, pass)
  .then((user) => {
    dispatch(setUser({ user, loading: false }))
  })
  .catch((err) => {
    setError(err.message || 'Unknown error occurred during login.')
  });
};

export default slice.reducer;
