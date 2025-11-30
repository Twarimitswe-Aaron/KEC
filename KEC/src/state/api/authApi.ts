// src/state/api/authApi.ts
import * as apiCore from "./apiSlice";

export interface UserState {
  id: number;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  email: string;
  role: "admin" | "teacher" | "student";
  profile?: {
    work?: string;
    education?: string;

    phone?: string;
    dateOfBirth?: string;
    updatedAt?: string;
    avatar?: string;
    province?: string;
    district?: string;
    sector?: string;
  };
}

export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profile: {
    id: number;
    avatar: string | null;
    work: string | null;
    education: string | null;
    phone: string | null;
    dateOfBirth: Date | null;

    province: string | null;
    district: string | null;
    sector: string | null;
  } | null; // profile may not exist
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
      query: () => "auth/me",
      providesTags: ["User"],
    }),
    signup: builder.mutation<
      {
        message: string;
        student: {
          id: number;
          email: string;
          firstName: string;
          lastName: string;
        };
      },
      SignUpRequest
    >({
      query: (body) => ({
        url: "student/create",
        method: "POST",
        body,
      }),
    }),
    getSpecificProfile: builder.query<UserProfileResponse, number>({
      query: (id) => `/auth/profile/${id}`,
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<
      { message: string; user: UserState },
      FormData
    >({
      query: (profileData) => ({
        url: "/auth/update-profile",
        method: "PUT",
        body: profileData,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    login: builder.mutation<any, { email: string; password: string }>({
      query: ({ email, password }) => ({
        url: "auth/login",
        method: "POST",
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
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          apiCore.resetCsrfToken();
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),
    requestPasswordReset: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: ({ email }) => ({
        url: "auth/requestCode",
        method: "POST",
        body: { email },
      }),
    }),
    verifyReset: builder.mutation<
      { email: string },
      { email: string; code: string }
    >({
      query: ({ email, code }) => ({
        url: "auth/verifyResetCode",
        method: "POST",
        body: { email, code },
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { email: string; password: string; confirmPassword: string }
    >({
      query: ({ email, password, confirmPassword }) => ({
        url: "auth/resetPassword",
        method: "POST",
        body: { email, password, confirmPassword },
      }),
    }),
    resetKnownPass: builder.mutation<
      { message: string },
      { email: string; password: string; confirmPassword: string }
    >({
      query: ({ email, password, confirmPassword }) => ({
        url: "auth/resetKnownPassword",
        method: "POST",
        body: { email, password, confirmPassword },
      }),
    }),
    getTopLocations: builder.query<
      { name: string; students: number; percent: string }[],
      void
    >({
      query: () => "auth/top-locations",
    }),
    getRating: builder.query<{ score: number; feedback?: string }, void>({
      query: () => "rating/me",
      providesTags: ["User"],
    }),
    submitRating: builder.mutation<
      { score: number; feedback?: string },
      { score: number; feedback?: string }
    >({
      query: (body) => ({
        url: "rating",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    submitServiceRequest: builder.mutation<
      { message: string },
      {
        name: string;
        phone: string;
        email?: string;
        province: string;
        district: string;
        sector: string;
        location: string;
        serviceType: string;
        equipmentDescription?: string;
        problemDescription?: string;
        problemImage?: string;
        installationDetails?: string;
        preferredDate?: string;
        preferredTime?: string;
        urgencyLevel?: string;
      }
    >({
      query: (body) => ({
        url: "service-request",
        method: "POST",
        body,
      }),
    }),
    getServiceRequests: builder.query<any[], void>({
      query: () => ({
        url: "service-request",
        method: "GET",
      }),
    }),
    updateServiceRequestStatus: builder.mutation<
      any,
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `service-request/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
    }),
    deleteServiceRequest: builder.mutation<any, number>({
      query: (id) => ({
        url: `service-request/${id}`,
        method: "DELETE",
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
  useUpdateProfileMutation,
  useGetSpecificProfileQuery,

  useGetTopLocationsQuery,
  useGetRatingQuery,
  useSubmitRatingMutation,
  useSubmitServiceRequestMutation,
  useGetServiceRequestsQuery,
  useUpdateServiceRequestStatusMutation,
  useDeleteServiceRequestMutation,
} = authApi;
