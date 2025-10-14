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
    }),
    overrideExisting: false,
})