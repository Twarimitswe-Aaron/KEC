import { apiSlice } from "./apiSlice";

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  role: string;
}

export interface MinimalUser {
  id: number;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchVerifiedUser: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: (body) => ({
        url: "/auth/update",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    createUser: builder.mutation<{ message: string }, CreateUserDto>({
      query: (body) => ({
        url: "/user/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getAllUsers: builder.query<MinimalUser[], void>({
      query: () => ({
        url: "/user/findAll",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    getTeamMembers: builder.query<
      Array<{
        id: number;
        name: string;
        title: string;
        avatar: string;
        role: string;
      }>,
      void
    >({
      query: () => ({
        url: "/user/team-members",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getUserDetails: builder.query<any, number>({
      query: (id) => ({
        url: `/user/${id}/details`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchVerifiedUserQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useGetTeamMembersQuery,
  useGetUserDetailsQuery,
} = userApi;
