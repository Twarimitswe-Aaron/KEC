import { apiSlice } from "./apiSlice";

export const csrfApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchCsrfToken: builder.query<{ csrfToken: string }, void>({
      query: () => "csrf/token",
    }),
  }),
});

export const { useFetchCsrfTokenQuery } = csrfApi;
