// src/state/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import { csrfApi } from './api/csrfApi';

export const store = configureStore({
  reducer: {
    // Register both APIs
    [apiSlice.reducerPath]: apiSlice.reducer,
    [csrfApi.reducerPath]: csrfApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, csrfApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
