import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
        credentials: 'include',
    }),
    tagTypes: ["User"],
    endpoints: (builder) => ({})
});