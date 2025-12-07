import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export enum AttendanceStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export interface AttendanceSession {
  id: number;
  courseId: number;
  createdById: number;
  title: string;
  status: AttendanceStatus;
  createdAt: string;
  closedAt?: string;
}

export interface AttendanceRecord {
  studentId: number;
  studentName: string;
  email: string;
  present: boolean;
  markedAt: string | null;
}

export interface AttendanceSessionDetail {
  session: {
    id: number;
    title: string;
    courseTitle: string;
    createdAt: string;
    status: AttendanceStatus;
  };
  attendanceList: AttendanceRecord[];
  summary: {
    totalStudents: number;
    present: number;
    absent: number;
  };
}

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/attendance`,
    credentials: "include",
  }),
  tagTypes: ["AttendanceSessions", "AttendanceRecords"],
  endpoints: (builder) => ({
    // Create attendance session (teacher)
    createAttendanceSession: builder.mutation<
      { message: string; session: AttendanceSession },
      { courseId: number; title?: string }
    >({
      query: (data) => ({
        url: "/session",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AttendanceSessions"],
    }),

    // Mark attendance (student)
    markAttendance: builder.mutation<{ message: string; record: any }, number>({
      query: (sessionId) => ({
        url: `/mark/${sessionId}`,
        method: "POST",
      }),
      invalidatesTags: ["AttendanceRecords"],
    }),

    // Get session records (teacher)
    getSessionRecords: builder.query<AttendanceSessionDetail, number>({
      query: (sessionId) => `/session/${sessionId}`,
      providesTags: ["AttendanceRecords"],
    }),

    // Get active sessions for a course
    getActiveSessions: builder.query<AttendanceSession[], number>({
      query: (courseId) => `/course/${courseId}/active`,
      providesTags: ["AttendanceSessions"],
    }),

    // Get all sessions for a course (teacher)
    getCourseSessions: builder.query<AttendanceSession[], number>({
      query: (courseId) => `/course/${courseId}/all`,
      providesTags: ["AttendanceSessions"],
    }),

    // Close session (teacher)
    closeSession: builder.mutation<
      { message: string; session: AttendanceSession },
      number
    >({
      query: (sessionId) => ({
        url: `/session/${sessionId}/close`,
        method: "PATCH",
      }),
      invalidatesTags: ["AttendanceSessions"],
    }),

    // Export to Excel (teacher) - returns blob
    exportToExcel: builder.mutation<Blob, number>({
      query: (sessionId) => ({
        url: `/export/${sessionId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useCreateAttendanceSessionMutation,
  useMarkAttendanceMutation,
  useGetSessionRecordsQuery,
  useGetActiveSessionsQuery,
  useGetCourseSessionsQuery,
  useCloseSessionMutation,
  useExportToExcelMutation,
} = attendanceApi;
