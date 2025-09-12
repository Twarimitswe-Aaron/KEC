import { apiSlice } from "./apiSlice";

interface UserState {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role: "user" | "admin";
}
export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  csrfToken: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserState, void>({
      query: () => "auth/me",
      providesTags: ["User"],
    }),
    signup: builder.mutation<any, SignUpRequest>({
      query: ({ csrfToken, ...body }) => ({
        url: "student/create",
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken },
        body,
      }),
    }),

    login: builder.mutation<
      any,
      { email: string; password: string; csrfToken: string }
    >({
      query: ({ email, password, csrfToken }) => ({
        url: "auth/login",
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        body: { email, password },
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
} = authApi;
