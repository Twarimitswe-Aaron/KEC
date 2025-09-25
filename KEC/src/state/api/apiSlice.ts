// src/state/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

let cachedCsrfToken: string | null = null;





export const resetCsrfToken = () => {
  cachedCsrfToken = null;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
    credentials: 'include',
    prepareHeaders: async (headers) => {
      if (!cachedCsrfToken) {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/csrf/token`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          cachedCsrfToken = data.csrfToken;
          console.log('Fetched new CSRF token:', cachedCsrfToken);
        }
      }
      if (cachedCsrfToken) {
        headers.set('x-csrf-token', cachedCsrfToken);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Announcement'],
  endpoints: () => ({}),
});

