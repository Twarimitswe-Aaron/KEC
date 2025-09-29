import * as apiCore from './apiSlice'

export interface announcementPost{
    content:string,
    posterId:number,
}

export interface feedBackPost{
    content:string,
    posterId:number,
}

export interface feedBackRes{
    content:string,
    createdAt:string,
    poster:{
        firstName:string,
        lastName:string,
        avatar:string,
        email:string,
    }
}

export interface announcementRes{
    content:string,
    createdAt:string,
    poster:{
        firstName:string,
        lastName:string,
        avatar:string,
        email:string
    }
}
export const announcementApi=apiCore.apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        announce:builder.mutation<{message:string},{body:announcementPost}>({
            query:(body)=>({
                url:'/announcement',
                method:'POST',
                body,
            })
        }),
        getAnnounce:builder.query<announcementRes[],void>({
            query:()=>'/announcement',
            providesTags:["Announcement"]
        }),
        getFeedBack:builder.query<feedBackRes[],void>({
            query: ()=>'/feedBack',
            providesTags:["Announcement"]
        }),
        postFeedBack:builder.mutation<{message:string},feedBackPost>({
            query:(body)=>({
                url:'/feedBack',
                method:"POST",
                body
            })
        })
    })
})

export const {
    useAnnounceMutation,
    useGetAnnounceQuery,
    useGetFeedBackQuery,
    usePostFeedBackMutation
}=announcementApi