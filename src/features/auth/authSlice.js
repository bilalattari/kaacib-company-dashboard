import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';
import Cookies from 'js-cookie';

export const login = createAsyncThunk('auth/login', async (payload) => {
  const res = await api.post(ENDPOINTS.COMPANY_LOGIN, payload);
  const data = res.data?.data || res.data;
  if (data?.token) Cookies.set('company-auth-token', data.token, { sameSite: 'lax' });
  return data;
});

export const signup = createAsyncThunk('auth/signup', async (payload) => {
  const res = await api.post(ENDPOINTS.COMPANY_SIGNUP, payload);
  const data = res.data?.data || res.data;
  if (data?.token) Cookies.set('company-auth-token', data.token, { sameSite: 'lax' });
  return data;
});

export const me = createAsyncThunk('auth/me', async () => {
  const res = await api.get(ENDPOINTS.COMPANY_ME);
  return res.data?.data || res.data;
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null },
  reducers: {
    logout(state) {
      Cookies.remove('company-auth-token');
      state.user = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload?.user || a.payload; })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.error?.message; })
      .addCase(signup.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(signup.fulfilled, (s, a) => { s.loading = false; s.user = a.payload?.user || a.payload; })
      .addCase(signup.rejected, (s, a) => { s.loading = false; s.error = a.error?.message; })
      .addCase(me.fulfilled, (s, a) => { s.user = a.payload?.user || a.payload; });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;


