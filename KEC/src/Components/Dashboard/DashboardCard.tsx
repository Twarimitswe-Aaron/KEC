import React, { useState, useContext, useEffect } from "react";
import { FaEye, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import CourseCard, { Course } from "./CourseCard";
import { UserRoleContext } from "../../UserRoleContext";
import { useNavigate } from "react-router-dom";
import { useEnrollCourseMutation } from "../../state/api/courseApi";
import CourseActionsMenu from "../CourseActionsMenu";
import { CourseStatus } from "../../state/api/courseApi";
import {
  useInitiatePaymentMutation,
  useLazyCheckPaymentStatusQuery,
  PaymentStatus,
} from "../../state/api/paymentApi";
import { toast } from "react-toastify";
import {
  getProvinces,
  getDistricts,
  getSectors,
} from "../../constants/rwanda-locations";

// Add fade-in-up animation
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
  }
`;

// Inject the styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (id: number) => void;
  currentUserId?: number;
}

// Country codes for African countries
const COUNTRY_CODES = [
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
];

const DashboardCard: React.FC<DashboardCardProps> = ({
  courses,
  onCourseAction,
  currentUserId,
}) => {
  const navigate = useNavigate();

  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const userRole = useContext(UserRoleContext);
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  // Payment-related state
  const [countryCode, setCountryCode] = useState("+250");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");

  // Location selection state
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const provinces = getProvinces();
  const districts = selectedProvince ? getDistricts(selectedProvince) : [];
  const sectors =
    selectedProvince && selectedDistrict
      ? getSectors(selectedProvince, selectedDistrict)
      : [];

  // Update location string when selections change
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedSector) {
      setLocation(
        `${selectedProvince}, ${selectedDistrict}, ${selectedSector}`
      );
    }
  }, [selectedProvince, selectedDistrict, selectedSector]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );
  const [paymentReferenceId, setPaymentReferenceId] = useState<string | null>(
    null
  );

  const [initiatePayment, { isLoading: isInitiatingPayment }] =
    useInitiatePaymentMutation();
  const [checkPaymentStatus] = useLazyCheckPaymentStatusQuery();

  // Poll payment status
  useEffect(() => {
    if (!paymentReferenceId || paymentStatus === PaymentStatus.SUCCESSFUL)
      return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(paymentReferenceId).unwrap();
        setPaymentStatus(result.payment.status);

        if (result.payment.status === PaymentStatus.SUCCESSFUL) {
          clearInterval(pollInterval);
          toast.success("Payment successful! Enrolling in course...");
          // Auto-enroll after successful payment
          handleEnrollingCourse();
        } else if (result.payment.status === PaymentStatus.FAILED) {
          clearInterval(pollInterval);
          toast.error("Payment failed. Please try again.");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [paymentReferenceId, paymentStatus]);

  const handleViewDetails = (course: Course) => {
    if (userRole === "admin" || userRole === "teacher") {
      navigate(`/course-creation/course/${course.id}`);
    }
  };

  const handleEnrollingCourse = async () => {
    if (!enrollingCourse?.id) return;
    try {
      await enrollCourse(enrollingCourse.id).unwrap();
      toast.success("Successfully enrolled in course!");
      setEnrollingCourse(null);
      resetPaymentForm();
      navigate(`/dashboard/course/${enrollingCourse.id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to enroll in course");
      setEnrollingCourse(null);
      resetPaymentForm();
    }
  };

  const handleCompletePayment = async () => {
    if (!enrollingCourse?.id || !phoneNumber || !location) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Remove any spaces and ensure phone number starts with country code
    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\s/g, "")}`;

    try {
      setPaymentStatus(PaymentStatus.PENDING);
      const result = await initiatePayment({
        courseId: enrollingCourse.id,
        phoneNumber: fullPhoneNumber,
        amount: parseFloat(enrollingCourse.price),
        location: {
          address: location,
          city: location.split(",")[1]?.trim() || location,
          province: location.split(",")[0]?.trim() || location,
          country:
            COUNTRY_CODES.find((c) => c.code === countryCode)?.name || "Rwanda",
        },
      }).unwrap();

      setPaymentReferenceId(result.referenceId);
      toast.info(
        "Payment initiated! Please check your phone for MTN MoMo prompt."
      );
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to initiate payment");
      setPaymentStatus(null);
    }
  };

  const resetPaymentForm = () => {
    setCountryCode("+250");
    setPhoneNumber("");
    setLocation("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedSector("");
    setPaymentStatus(null);
    setPaymentReferenceId(null);
  };

  const handleCloseDetails = () => {};

  return (
    <>
      {/* Course cards */}
      <div className="grid grid-cols-1 mt-4 scroll-hide sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <div
            key={course.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 overflow-hidden hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative">
              {/* Course Actions Menu - Top Right */}
              {(userRole === "admin" || userRole === "teacher") &&
                course.id && (
                  <div className="absolute top-2 right-2 z-10">
                    <CourseActionsMenu
                      courseId={course.id}
                      courseName={course.title}
                      courseStatus={course.status as CourseStatus}
                    />
                  </div>
                )}

              {/* Status Badge - Top Left */}
              {course.status && (
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      course.status === "ACTIVE"
                        ? "bg-green-500/20 text-green-700 border border-green-500/30"
                        : "bg-gray-500/20 text-gray-700 border border-gray-500/30"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
              )}

              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/400x200/004e64/white?text=${course.title}`;
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#004e64] mb-2 ">
                  {course.title}
                </h3>
                {(userRole?.toLowerCase() === "teacher" ||
                  userRole?.toLowerCase() === "admin") && (
                  <div>
                    <p
                      className="text-[#004e64] cursor-pointer hover:text-[#003a4c] transition-colors text-lg flex items-center gap-2"
                      onClick={() => handleViewDetails(course)}
                    >
                      <FaEye />
                    </p>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {course.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="bg-[#034153]/10 px-2.5 py-1 rounded-lg">
                  <p className="text-[#034153] font-bold text-sm">
                    RWF {course.price}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{course.no_lessons} lessons</span>
                </div>
              </div>

              {userRole === "student" && course.id !== undefined && (
                <button
                  onClick={() => {
                    if (course.enrolled) {
                      // Can access if ACTIVE or ENDED (until certificate issued)
                      if (
                        course.status === "ACTIVE" ||
                        (course.status === "ENDED" && !course.certificateIssued)
                      ) {
                        onCourseAction(course.id!); // continue course
                        navigate(`/dashboard/course/${course.id}`);
                      }
                    } else if (course.open && course.status === "ACTIVE") {
                      setEnrollingCourse(course); // open enrollment modal
                    }
                  }}
                  disabled={
                    course.completed || // Has certificate
                    (course.status === "ENDED" && course.certificateIssued) || // Certificate issued
                    (!course.open && !course.enrolled)
                  }
                  className={`mt-4  w-full px-4 py-2 rounded text-white transition-colors ${
                    course.completed ||
                    (course.status === "ENDED" && course.certificateIssued)
                      ? "bg-gray-400 cursor-not-allowed"
                      : course.enrolled
                      ? "bg-[#034153] cursor-pointer"
                      : course.open && course.status === "ACTIVE"
                      ? "bg-[#034154] cursor-pointer"
                      : "bg-gray-400  cursor-not-allowed"
                  }`}
                >
                  {course.completed
                    ? "Completed"
                    : course.certificateIssued
                    ? "Certificate Issued"
                    : course.status === "ENDED" && course.enrolled
                    ? "Continue (Awaiting Certificate)"
                    : course.enrolled
                    ? "Continue Course"
                    : course.open && course.status === "ACTIVE"
                    ? "Start Course"
                    : "Course Closed"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enrollment Modal */}
      {enrollingCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl p-6 max-w-lg w-full relative transform scale-100 animate-in slide-in-from-bottom-4 duration-500">
            {/* Close Button */}
            <button
              onClick={() => {
                setEnrollingCourse(null);
                resetPaymentForm();
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header with Course Info */}
            <div className="mb-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#004e64] to-[#025a73] bg-clip-text text-transparent mb-3">
                {enrollingCourse.title}
              </h2>

              <p className="text-gray-600 leading-relaxed mb-2">
                {enrollingCourse.description}
              </p>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-md">Course Price</span>
                  <span className="text-lg font-bold text-[#004e64]">
                    RWF {enrollingCourse.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Enrollment Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Allow direct enrollment without payment requirement
                handleEnrollingCourse();
              }}
              className="space-y-2"
            >
              {/* Location Selection */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-sm tracking-wide">
                  Location
                </label>
                <div className="flex gap-2">
                  {/* Province Select */}
                  <div className="relative flex-1">
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setSelectedDistrict("");
                        setSelectedSector("");
                      }}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004e64] focus:border-transparent transition-all duration-200 bg-white/50 text-xs"
                    >
                      <option value="">Province</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Select */}
                  <div className="relative flex-1">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedSector("");
                      }}
                      disabled={!selectedProvince}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004e64] focus:border-transparent transition-all duration-200 bg-white/50 text-xs disabled:bg-gray-100/50 disabled:text-gray-400"
                    >
                      <option value="">District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sector Select */}
                  <div className="relative flex-1">
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      disabled={!selectedDistrict}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004e64] focus:border-transparent transition-all duration-200 bg-white/50 text-xs disabled:bg-gray-100/50 disabled:text-gray-400"
                    >
                      <option value="">Sector</option>
                      {sectors.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Phone Input with Country Code Selector */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-sm tracking-wide">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-32 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004e64] focus:border-transparent transition-all duration-200 bg-white text-sm"
                  >
                    {COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>

                  {/* Phone Number Input */}
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="733 123 450"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004e64] focus:border-transparent transition-all duration-200 bg-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter number without country code (e.g., 733123450)
                </p>
              </div>

              {/* Enroll Button - Payment section disabled for now */}
              <button
                type="submit"
                disabled={isEnrolling || !phoneNumber || !location}
                className="w-full bg-gradient-to-r from-[#004e64] to-[#025a73] hover:from-[#025a73] hover:to-[#034153] text-white font-bold py-3 px-6 rounded-md shadow-md hover:shadow-lg transform cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {isEnrolling ? "Enrolling..." : "Enroll Now"}
              </button>

              <p className="text-xs text-center text-gray-500 mt-2">
                Payment integration coming soon - Free enrollment for now
              </p>
            </form>

            {/* Security Notice */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                />
              </svg>
              Your information is secure and encrypted
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardCard;
