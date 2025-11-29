import { apiSlice } from "./apiSlice";

// Payment-related TypeScript interfaces
export interface LocationData {
  address: string;
  city: string;
  province: string;
  country?: string;
}

export interface InitiatePaymentRequest {
  courseId: number;
  phoneNumber: string;
  amount: number;
  location: LocationData;
}

export interface InitiatePaymentResponse {
  referenceId: string;
  message: string;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
}

export interface Payment {
  id: number;
  referenceId: string;
  courseId: number;
  userId: number;
  phoneNumber: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  location?: LocationData;
}

export interface CheckPaymentStatusResponse {
  payment: Payment;
  momoStatus?: any;
}

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiatePayment: builder.mutation<
      InitiatePaymentResponse,
      InitiatePaymentRequest
    >({
      query: (body) => ({
        url: "/payment/initiate",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),

    checkPaymentStatus: builder.query<CheckPaymentStatusResponse, string>({
      query: (referenceId) => `/payment/status/${referenceId}`,
      providesTags: (result, error, referenceId) => [
        { type: "Payment", id: referenceId },
      ],
    }),

    getMyPayments: builder.query<Payment[], void>({
      query: () => "/payment/my-payments",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Payment" as const, id })),
              { type: "Payment", id: "LIST" },
            ]
          : [{ type: "Payment", id: "LIST" }],
    }),

    checkCourseAccess: builder.query<{ canAccess: boolean }, number>({
      query: (courseId) => `/payment/course/${courseId}/access`,
      providesTags: (result, error, courseId) => [
        { type: "Payment", id: `course-${courseId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useInitiatePaymentMutation,
  useCheckPaymentStatusQuery,
  useLazyCheckPaymentStatusQuery,
  useGetMyPaymentsQuery,
  useCheckCourseAccessQuery,
} = paymentApi;
