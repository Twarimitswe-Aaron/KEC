
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const csrfApi = createApi({
  reducerPath: 'csrfApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    fetchCsrfToken: builder.query<{ csrfToken: string }, void>({
      query: () => '/csrf/token',
    }),
  }),
});

export const { useFetchCsrfTokenQuery } = csrfApi;

