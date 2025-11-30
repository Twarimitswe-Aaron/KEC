import { apiSlice } from "./apiSlice";

export interface CourseStat {
  id: string;
  name: string;
  image: string;
  sales: number;
  earnings: number;
}

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklyCourseStats: builder.query<CourseStat[], void>({
      query: () => "/analytics/weekly-course-stats",
      providesTags: [{ type: "Course", id: "WEEKLY_STATS" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetWeeklyCourseStatsQuery } = analyticsApi;
