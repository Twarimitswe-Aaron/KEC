import { apiSlice } from "./apiSlice";

export interface Certificate {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  issueDate: string | null;
  studentId: number;
  courseId: number;
  templateId: number | null;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  certificateNumber?: string;
  description?: string | null;
  student: {
    id: number;
    userId: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      profile?: {
        avatar?: string;
      };
    };
  };
  course: {
    id: number;
    title: string;
    description: string;
    coursePrice: string;
    image_url: string;
    passingGrade?: number;
  };
}

export const certificateApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getCertificates: build.query<Certificate[], void>({
      query: () => "certificates",
      providesTags: ["Certificates"],
    }),
    updateCertificateStatus: build.mutation<
      Certificate,
      {
        id: number;
        status: string;
        rejectionReason?: string;
        certificateNumber?: string;
        description?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `certificates/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Certificates"],
    }),

    generateCertificates: build.mutation<
      { message: string; certificates: Certificate[] },
      { courseId: number; studentIds?: number[] }
    >({
      query: (body) => ({
        url: "certificates/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Certificates"],
    }),

    getEndedCoursesWithStudents: build.query<
      Array<{
        id: number;
        title: string;
        description: string;
        certificateDescription?: string;
        image_url: string;
        students: Array<{
          id: number;
          name: string;
          email: string;
          phone: string;
          avatar: string | null;
        }>;
      }>,
      void
    >({
      query: () => "certificates/pending-courses",
      providesTags: ["Certificates"],
    }),

    uploadCertificateTemplate: build.mutation<
      any,
      { file: File; courseId?: number; name?: string }
    >({
      query: ({ file, courseId, name }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (courseId) formData.append("courseId", courseId.toString());
        if (name) formData.append("name", name);

        return {
          url: "certificates/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Certificates"],
    }),
  }),
});

export const {
  useGetCertificatesQuery,
  useUpdateCertificateStatusMutation,
  useGenerateCertificatesMutation,
  useGetEndedCoursesWithStudentsQuery,
  useUploadCertificateTemplateMutation,
} = certificateApi;
