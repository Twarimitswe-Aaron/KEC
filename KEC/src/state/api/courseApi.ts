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

export const courseApi=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        createCourse:builder.mutation<{message:string},createCourseDto>({
            query:(body)=>({
                url:"/course/create-course",
                method:"POST",
                body
            })
        })

    })
})

export const { useCreateCourseMutation } = courseApi