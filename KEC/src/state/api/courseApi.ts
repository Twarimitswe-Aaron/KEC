import { apiSlice } from "./apiSlice";
interface createCourseDto{
    
    title:string
    description:string
    image_url:string
    price:string
    uploader:{
        id:number
    }


}

interface getAllUploaded{
    id:number;
    title:string;
    description:string;
    price:string;
    image_url:string;
    no_lessons:string;
    open:boolean;
    uploader:{
        name:string;
        avatar_url:string;
    }


}

export const courseApi=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        createCourse:builder.mutation<{message:string},createCourseDto>({
            query:(body)=>({
                url:"/course/create-course",
                method:"POST",
                body
            }),
            invalidatesTags: ["Course"],
        }),
        getUploadedCourses:builder.query<getAllUploaded[],void>({
            query:()=>"/course/get-uploaded-courses",
            providesTags:["Course"]

        })

    })
})

export const { useCreateCourseMutation,useGetUploadedCoursesQuery } = courseApi