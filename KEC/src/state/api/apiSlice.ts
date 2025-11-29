import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let cachedCsrfToken: string | null = null;
export const resetCsrfToken = () => {
  cachedCsrfToken = null;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  credentials: "include", // This sends cookies with every request
  prepareHeaders: async (headers) => {
    if (!cachedCsrfToken) {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
        }/csrf/token`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        cachedCsrfToken = data.csrfToken;
      }
    }
    if (cachedCsrfToken) {
      headers.set("x-csrf-token", cachedCsrfToken);
    }
    return headers;
  },
});

const csrfAwareBaseQuery: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && (result.error as any).status === 403) {
    // Likely CSRF/session mismatch (e.g., server restart). Reset and retry once.
    resetCsrfToken();
    result = await rawBaseQuery(args, api, extraOptions);
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: csrfAwareBaseQuery,
  tagTypes: [
    "User",
    "Announcement",
    "Course",
    "Lesson",
    "Quiz",
    "QuizAttempt",
    "Resource",
    "Chat",
    "Message",
    "Certificates",
    "Payment",
  ],
  endpoints: () => ({}),
});
