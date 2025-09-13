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
    requestPasswordReset: builder.mutation<
      {message:string},
      { email: string; csrfToken: string }
    >({
      query: ({ email, csrfToken }) => ({
        url: "auth/requestCode",
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        body: { email },
      }),
    }),
    verifyReset: builder.mutation<{email:string},{ email: string; token: string; csrfToken: string }>({
      query: ({ email, token, csrfToken }) => ({
        url: "auth/verifyResetCode",
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        body: { email, token },
      }),
    }),
    resetPassword: builder.mutation<
      {message:string},
      {
        email: string;
        password: string;
        confirmPassword: string;
        csrfToken: string;
      }
    >({
      query: ({ email, password, confirmPassword, csrfToken }) => ({
        url: "auth/resetPassword",
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        body: { email, password, confirmPassword },
      }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  useRequestPasswordResetMutation,
  useVerifyResetMutation,
  useResetPasswordMutation,
} = authApi;
