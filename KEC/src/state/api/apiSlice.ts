// src/state/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Store CSRF token in memory to avoid repeated fetches
let cachedCsrfToken: string | null = null;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
    credentials: 'include',
    prepareHeaders: async (headers) => {
      try {
        if (!cachedCsrfToken) {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/csrf/token`, {
            credentials: 'include',
          });
          const { csrfToken } = await response.json();
          if (csrfToken) {
            cachedCsrfToken = csrfToken;
            console.log('Fetched CSRF token:', csrfToken);
          } else {
            console.error('Failed to fetch CSRF token');
          }
        }
        if (cachedCsrfToken) {
          headers.set('X-CSRF-Token', cachedCsrfToken);
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({}),
});

// Optional: Reset cached token on session change or logout
export const resetCsrfToken = () => {
  cachedCsrfToken = null;
};