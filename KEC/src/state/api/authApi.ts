// src/state/api/authApi.ts
import * as apiCore from './apiSlice';

interface UserState {
  id: number;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  profile?: {
    work?: string;
    education?: string;
    resident?: string;
    phone?: string;
    createdAt?: string;
    avatar?: string; 
  };
}


export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

}

export const authApi = apiCore.apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserState, void>({
      query: () => 'auth/me',
      providesTags: ['User'],
    }),
    signup: builder.mutation<
      { message: string; student: { id: number; email: string; firstName: string; lastName: string } },
      SignUpRequest
    >({
      query: (body) => ({
        url: 'student/create',
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation<{message:string,user:UserState}, FormData>({
      query: (profileData) => ({
        url: "/auth/update-profile",
        method: "PUT",
        body: profileData,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    login: builder.mutation<
      any,
      { email: string; password: string }
    >({
      query: ({ email, password }) => ({
        url: 'auth/login',
        method: 'POST',
        body: { email, password },
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          apiCore.resetCsrfToken(); // Reset cached CSRF token on logout
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },
    }),
    requestPasswordReset: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: ({ email }) => ({
        url: 'auth/requestCode',
        method: 'POST',
        body: { email },
      }),
    }),
    verifyReset: builder.mutation<
      { email: string },
      { email: string; code: string }
    >({
      query: ({ email, code }) => ({
        url: 'auth/verifyResetCode',
        method: 'POST',
        body: { email, code },
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { email: string; password: string; confirmPassword: string }
    >({
      query: ({ email, password, confirmPassword }) => ({
        url: 'auth/resetPassword',
        method: 'POST',
        body: { email, password, confirmPassword },
      }),
    }),
    resetKnownPass: builder.mutation<
      { message: string },
      { email: string; password: string; confirmPassword: string }
    >({
      query: ({ email, password, confirmPassword }) => ({
        url: 'auth/resetKnownPassword',
        method: 'POST',
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
  useResetKnownPassMutation,
  useUpdateProfileMutation 
} = authApi;