import { apiSlice } from "./apiSlice";

export const lessonApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLessonByCourseId: builder.query<any, number>({
        query: (id) => ({
            url: `/lesson/lesson-by-course/${id}`,
            method: "GET",
        }),
        providesTags: ["Lesson"],
        }),
        createLesson: builder.mutation<{message:string}, {courseId:number, title:string, description:string}>({
        query: ({courseId, title, description}) => ({
            url: `/modules/${courseId}`,
            method: "POST",
            body: { title, description },
        }),
        invalidatesTags: ["Lesson"],
        }),
        
    }),
    overrideExisting: false,
})

export const { useGetLessonByCourseIdQuery, useCreateLessonMutation } = lessonApi;