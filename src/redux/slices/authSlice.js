import { createSlice } from '@reduxjs/toolkit';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from '../../helpers/index';

const token = getAuthToken();

const initialState = {
  user: null,
  token: token || null,
  status: 'idle',
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token } = action.payload;
      state.status = 'succeeded';
      state.user = user;
      state.token = token;
      setAuthToken({ user, token });
    },
    logOut: (state) => {
      state.status = 'idle';
      state.user = null;
      state.token = null;
      state.error = null;
      removeAuthToken();
    },
  },
});

export const selectUser = (state) => state.auth.user;
export const selectUserToken = (state) => state.auth.token;
export const selectUserStatus = (state) => state.auth.status;
export const selectUserError = (state) => state.auth.error;
export const { login, logOut } = authSlice.actions;
export default authSlice.reducer;
