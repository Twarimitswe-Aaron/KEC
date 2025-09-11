import { apiSlice } from "./apiSlice";

export const userApi=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        fetchVerifiedUser:builder.query({
            query:()=>'/auth/me',
            providesTags:["User"],
        }),
        updateUser:builder.mutation({
            query:(body)=>({
                url:"/auth/update",
                method:"POST",
                body
            }),
            invalidatesTags:["User"]
        })
    }),
    overrideExisting:false,

})

export const {useFetchVerifiedUserQuery,useUpdateUserMutation}=userApi;