import { apiSlice } from "./apiSlice";

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

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create attendance session (teacher)
    createAttendanceSession: builder.mutation<
      { message: string; session: AttendanceSession },
      { courseId: number; title?: string }
    >({
      query: (data) => ({
        url: "/attendance/session",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AttendanceSessions"],
    }),

    // Mark attendance (student)
    markAttendance: builder.mutation<{ message: string; record: any }, number>({
      query: (sessionId) => ({
        url: `/attendance/mark/${sessionId}`,
        method: "POST",
      }),
      invalidatesTags: ["AttendanceRecords", "AttendanceSessions"],
    }),

    // Get session records (teacher)
    getSessionRecords: builder.query<AttendanceSessionDetail, number>({
      query: (sessionId) => `/attendance/session/${sessionId}`,
      providesTags: ["AttendanceRecords"],
    }),

    // Get active sessions for a course
    getActiveSessions: builder.query<AttendanceSession[], number>({
      query: (courseId) => `/attendance/course/${courseId}/active`,
      providesTags: ["AttendanceSessions"],
    }),

    // Get all sessions for a course (teacher)
    getCourseSessions: builder.query<AttendanceSession[], number>({
      query: (courseId) => `/attendance/course/${courseId}/all`,
      providesTags: ["AttendanceSessions"],
    }),

    // Close session (teacher)
    closeSession: builder.mutation<
      { message: string; session: AttendanceSession },
      number
    >({
      query: (sessionId) => ({
        url: `/attendance/session/${sessionId}/close`,
        method: "PATCH",
      }),
      invalidatesTags: ["AttendanceSessions"],
    }),

    // Export to Excel (teacher) - returns blob
    exportToExcel: builder.mutation<Blob, number>({
      query: (sessionId) => ({
        url: `/attendance/export/${sessionId}`,
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

// Alias for convenience
export const useCreateSessionMutation = useCreateAttendanceSessionMutation;
