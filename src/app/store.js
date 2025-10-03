import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import assetsReducer from '../features/assets/assetsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
  },
});


