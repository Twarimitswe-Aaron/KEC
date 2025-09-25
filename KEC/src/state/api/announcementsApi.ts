import * as apiCore from './apiSlice'

export interface announcementPost{
    content:string,
    posterId:number,
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
        })
    })
})

export const {
    useAnnounceMutation,
    useGetAnnounceQuery
}=announcementApi