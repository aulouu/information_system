import { configureStore } from '@reduxjs/toolkit';
import RegisterSlice from './Slices/RegisterSlice';
import LoginSlice from './Slices/LoginSlice';
import AppSlice from './Slices/AppSlice';

const store = configureStore({
  reducer:{
    signup: RegisterSlice,
    signin: LoginSlice,
    app: AppSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
