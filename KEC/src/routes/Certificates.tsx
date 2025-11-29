import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaDownload,
  FaCheck,
  FaTimes,
  FaClock,
  FaFilter,
  FaCertificate,
  FaChevronDown,
  FaChevronRight,
  FaUsers,
  FaEllipsisV,
  FaUpload,
  FaEdit,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetEndedCoursesWithStudentsQuery,
  useUpdateCertificateStatusMutation,
  useUploadCertificateTemplateMutation,
} from "../state/api/certificateApi";
import {
  CertificateTemplate1,
  CertificateTemplate2,
} from "../Components/Certificate/CertificateTemplates";
import { useUpdateCourseMutation } from "../state/api/courseApi";
import { FaBook } from "react-icons/fa6";

// Types
interface Certificate {
  id: number;
  status: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profile?: {
        avatar: string | null;
      };
    };
  };
  courseId: number;
  createdAt: string;
  certificateNumber: string | null;
  rejectionReason: string | null;
  issueDate: string | null;
  description: string | null;
}

type TabType = "all" | "pending" | "approved" | "rejected";

// Character limits to prevent certificate overflow
const MAX_DESCRIPTION_LENGTH = 400;
const MAX_INSTRUCTOR_NAME_LENGTH = 50;

// Component
const Certificates: React.FC = () => {
  // API hooks
  const { data: endedCourses = [], isLoading: isLoadingCourses } =
    useGetEndedCoursesWithStudentsQuery();
  console.log(endedCourses);
  const [updateStatus] = useUpdateCertificateStatusMutation();
  const [uploadTemplate] = useUploadCertificateTemplateMutation();

  // State
  const [selectedTab, setSelectedTab] = useState<TabType>("all");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Certificate | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [certificateDescription, setCertificateDescription] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set()
  );
  const [openMenuCourseId, setOpenMenuCourseId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewTemplateModal, setShowViewTemplateModal] = useState(false);
  const [showViewCertificateModal, setShowViewCertificateModal] =
    useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "template1" | "template2"
  >("template1");

  // Template editing state
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [templateDescription, setTemplateDescription] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [updateCourse] = useUpdateCourseMutation();

  const [sortBy, setSortBy] = useState("newest");
  const [sortDirection, setSortDirection] = useState("asc");
  const [openMenuRequestId, setOpenMenuRequestId] = useState<number | null>(
    null
  );

  // Toggle course expansion
  const toggleCourseExpansion = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  // Generate certificate number
  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `CERT-${year}-${randomNum}`;
  };

  // Approve certificate request
  const approveCertificate = async (request: Certificate) => {
    try {
      const certificateNumber = generateCertificateNumber();
      const courseData = endedCourses.find(
        (c: any) => c.id === request.courseId
      );

      await updateStatus({
        studentId: request.id,
        courseId: request.courseId,
        status: "APPROVED",
        certificateNumber,
        description:
          courseData?.certificateDescription || courseData?.description || "",
      }).unwrap();
      toast.success("Certificate approved successfully");
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Failed to approve certificate");
      console.error(error);
    }
  };

  // Reject certificate request
  const rejectCertificate = async (request: Certificate) => {
    try {
      console.log("Rejecting certificate with request:", request);
      console.log("Payload:", {
        studentId: request.id,
        courseId: request.courseId,
        status: "REJECTED",
        rejectionReason: rejectionReason,
      });

      await updateStatus({
        studentId: request.id,
        courseId: request.courseId,
        status: "REJECTED",
        rejectionReason: rejectionReason,
      }).unwrap();
      toast.success("Certificate rejected");
      setShowRejectionModal(false);
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject certificate");
      console.error(error);
    }
  };

  // Group students by course (from ended courses)
  const getCoursesWithRequests = () => {
    return endedCourses.map((course: any) => ({
      course: {
        id: course.id,
        title: course.title,
        description: course.description || "Course completed",
        certificateDescription: course.certificateDescription,
        instructorName: course.instructorName,
        passingGrade: 70,
      },
      requests: course.students.map((student: any) => ({
        id: student.id,
        status: student.status || "PENDING",
        student: {
          user: {
            firstName: student.name.split(" ")[0] || "",
            lastName: student.name.split(" ").slice(1).join(" ") || "",
            email: student.email,
            profile: {
              avatar: student.avatar,
            },
          },
        },
        courseId: course.id,
        createdAt: student.createdAt || new Date().toISOString(),
        certificateNumber: student.certificateNumber,
        rejectionReason: student.rejectionReason,
        issueDate: student.issueDate,
      })),
      counts: {
        total: course.students.length,
        pending: course.students.filter(
          (s: any) => (s.status || "PENDING") === "PENDING"
        ).length,
        approved: course.students.filter((s: any) => s.status === "APPROVED")
          .length,
        rejected: course.students.filter((s: any) => s.status === "REJECTED")
          .length,
      },
    }));
  };

  // Tab counts
  const totalStudents = endedCourses.reduce(
    (sum: number, course: any) => sum + course.students.length,
    0
  );
  const tabCounts = {
    all: totalStudents,
    pending: totalStudents,
    approved: 0,
    rejected: 0,
  };

  const coursesData = getCoursesWithRequests();

  const FilterControls: React.FC = () => {
    const currentCount = totalStudents;

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-6">
        <div className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Left Section - Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaFilter
                  className="h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-gray-700">
                  Filter:
                </span>
                <select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value as TabType)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Right Section - Sort and Count */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Student Name</option>
                  <option value="course">Course Name</option>
                </select>
              </div>
              <button
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 transition-transform ${
                    sortDirection === "desc" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path d="m3 8 4-4 4 4"></path>
                  <path d="M7 4v16"></path>
                  <path d="M11 12h4"></path>
                  <path d="M11 16h7"></path>
                  <path d="M11 20h10"></path>
                </svg>
              </button>
              <div className="text-sm text-gray-500">
                {currentCount} certificate{currentCount !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoadingCourses) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-md p-6">
      <div className="max-w-6xl mx-auto">
        <FilterControls />

        <div className="space-y-4">
          {coursesData.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-16 text-center">
              <FaCertificate className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No certificate requests found
              </h3>
              <p className="text-gray-400">
                Certificate requests will appear here when students complete
                courses
              </p>
            </div>
          ) : (
            coursesData.map(({ course, requests, counts }) => (
              <div
                key={course.id}
                className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 ${
                  openMenuCourseId === course.id ||
                  requests.some((r: any) => r.id === openMenuRequestId)
                    ? "z-30 relative"
                    : "z-0 relative"
                }`}
              >
                {/* Course Header */}
                <div
                  className={`p-5 cursor-pointer hover:bg-white/50 transition-all rounded-t-xl ${
                    !expandedCourses.has(course.id) ? "rounded-b-xl" : ""
                  }`}
                  onClick={() => toggleCourseExpansion(course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800">
                        {course.title}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {/* Passing grade removed */}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Request Counts */}
                      <div className="flex gap-3 items-center">
                        <div className="flex gap-1 items-center" title="Total">
                          <div className="bg-gray-800 w-2 h-2 rounded-full"></div>
                          <span className="text-xs font-semibold text-gray-700">
                            {counts.total}
                          </span>
                        </div>
                        {counts.pending > 0 && (
                          <div
                            className="flex gap-1 items-center"
                            title="Pending"
                          >
                            <div className="bg-yellow-400 w-2 h-2 rounded-full"></div>
                            <span className="text-xs font-semibold text-gray-700">
                              {counts.pending}
                            </span>
                          </div>
                        )}
                        {counts.approved > 0 && (
                          <div
                            className="flex gap-1 items-center"
                            title="Approved"
                          >
                            <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                            <span className="text-xs font-semibold text-gray-700">
                              {counts.approved}
                            </span>
                          </div>
                        )}
                        {counts.rejected > 0 && (
                          <div
                            className="flex gap-1 items-center"
                            title="Rejected"
                          >
                            <div className="bg-red-400 w-2 h-2 rounded-full"></div>
                            <span className="text-xs font-semibold text-gray-700">
                              {counts.rejected}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Template Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuCourseId(
                              openMenuCourseId === course.id ? null : course.id
                            );
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <FaEllipsisV className="text-gray-600" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuCourseId === course.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCourse(course);
                                  setShowViewTemplateModal(true);
                                  setOpenMenuCourseId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FaEye className="text-blue-600" />
                                View Template
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCourse(course);
                                  setShowUploadModal(true);
                                  setOpenMenuCourseId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FaUpload className="text-green-600" />
                                Upload Template
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCourse(course);
                                  setTemplateDescription(
                                    course.certificateDescription ||
                                      course.description ||
                                      ""
                                  );
                                  setInstructorName(
                                    course.instructorName || ""
                                  );
                                  setShowEditTemplateModal(true);
                                  setOpenMenuCourseId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FaEdit className="text-yellow-600" />
                                Edit Template Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className="text-gray-600 transition-transform duration-300">
                        {expandedCourses.has(course.id) ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Requests */}
                {expandedCourses.has(course.id) && (
                  <div className="bg-white/40 backdrop-blur-sm divide-y divide-gray-200/50 rounded-b-xl">
                    {requests.length === 0 ? (
                      <div className="p-12 text-center">
                        <FaUsers className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">
                          No certificate requests for this course
                          {selectedTab !== "all" &&
                            ` with status: ${selectedTab}`}
                        </p>
                      </div>
                    ) : (
                      requests.map((request: Certificate, index: number) => (
                        <div
                          key={index}
                          className="p-6 cursor-pointer hover:bg-gray-100 transition-all duration-300 border-b border-gray-200/50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <img
                                    src={
                                      request.student.user.profile?.avatar ||
                                      "https://via.placeholder.com/48"
                                    }
                                    alt={request.student.user.firstName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                  />
                                  <div
                                    className={`absolute -bottom-1 -right-1 rounded-full p-1 ${
                                      request.status === "APPROVED"
                                        ? "bg-green-500"
                                        : request.status === "PENDING"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    } text-white shadow-md`}
                                  >
                                    {request.status === "APPROVED" && (
                                      <FaCheck className="text-[10px]" />
                                    )}
                                    {request.status === "PENDING" && (
                                      <FaClock className="text-[10px]" />
                                    )}
                                    {request.status === "REJECTED" && (
                                      <FaTimes className="text-[10px]" />
                                    )}
                                  </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                  {request.student.user.firstName}{" "}
                                  {request.student.user.lastName}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuRequestId(
                                      openMenuRequestId === request.id
                                        ? null
                                        : request.id
                                    );
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                  aria-label="Request options"
                                >
                                  <FaEllipsisV
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </button>

                                {openMenuRequestId === request.id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                                    <div className="py-1">
                                      {request.status === "PENDING" && (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedRequest(request);
                                              const courseData =
                                                endedCourses.find(
                                                  (c: any) =>
                                                    c.id === request.courseId
                                                );
                                              setCertificateDescription(
                                                courseData?.certificateDescription ||
                                                  courseData?.description ||
                                                  ""
                                              );
                                              setShowApprovalModal(true);
                                              setOpenMenuRequestId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
                                          >
                                            <FaCheck className="text-green-500" />
                                            Approve
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedRequest(request);
                                              setShowRejectionModal(true);
                                              setOpenMenuRequestId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
                                          >
                                            <FaTimes className="text-red-500" />
                                            Reject
                                          </button>
                                          <div className="border-t border-gray-200"></div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedRequest(request);
                                              setShowInfoModal(true);
                                              setOpenMenuRequestId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                          >
                                            <FaEye className="text-gray-500" />
                                            View Info
                                          </button>
                                        </>
                                      )}
                                      {request.status === "APPROVED" && (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedRequest(request);
                                              setShowViewCertificateModal(true);
                                              setOpenMenuRequestId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                                          >
                                            <FaEye className="text-blue-500" />
                                            View Certificate
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMenuRequestId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
                                          >
                                            <FaDownload className="text-green-500" />
                                            Download PDF
                                          </button>
                                          <div className="border-t border-gray-200"></div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedRequest(request);
                                              setShowInfoModal(true);
                                              setOpenMenuRequestId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                          >
                                            <FaEye className="text-gray-500" />
                                            View Info
                                          </button>
                                        </>
                                      )}
                                      {request.status === "REJECTED" && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRequest(request);
                                            setShowInfoModal(true);
                                            setOpenMenuRequestId(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                        >
                                          <FaEye className="text-gray-500" />
                                          View Info
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Additional Details - Only show issue date if approved */}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-6xl p-6 shadow-2xl border border-white/50 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Approve Certificate
              </h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-2">
              {/* Preview Section */}
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-gray-700">Preview</h4>
                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center border border-gray-200 shadow-inner min-h-[400px]">
                  <div className="w-full transform scale-90 origin-top">
                    <CertificateTemplate1
                      studentName={`${selectedRequest.student.user.firstName} ${selectedRequest.student.user.lastName}`}
                      courseName={
                        endedCourses.find(
                          (c: any) => c.id === selectedRequest.courseId
                        )?.title || "Course Name"
                      }
                      courseDescription={
                        certificateDescription ||
                        "For successfully completing the comprehensive course curriculum and demonstrating proficiency in the subject matter."
                      }
                      issueDate={new Date().toLocaleDateString()}
                      instructorName={
                        endedCourses.find(
                          (c: any) => c.id === selectedRequest.courseId
                        )?.instructorName || "Instructor Name"
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="flex flex-col gap-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FaCheck className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Confirm Approval
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You are about to approve the certificate for{" "}
                        <span className="font-bold">
                          {selectedRequest.student.user.firstName}{" "}
                          {selectedRequest.student.user.lastName}
                        </span>
                        . This will generate a permanent certificate record and
                        notify the student.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex gap-4">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => approveCertificate(selectedRequest)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Confirm & Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md p-8 shadow-2xl border border-white/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-3xl text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Reject Certificate
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this certificate request.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-white/80 backdrop-blur-sm"
                rows={4}
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectCertificate(selectedRequest)}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Template Modal */}
      {showUploadModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md p-8 shadow-2xl border border-white/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUpload className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Template
              </h3>
              <p className="text-gray-600 mb-4">
                Upload a certificate template for {selectedCourse.title}.
                Supported formats: PNG, JPG.
              </p>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
                onClick={() =>
                  document.getElementById("template-upload")?.click()
                }
              >
                <input
                  type="file"
                  id="template-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }}
                />
                {uploadedFile ? (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-blue-600">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs mt-1">Click to change</p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <FaUpload className="mx-auto text-2xl mb-2 text-gray-400" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedFile(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!uploadedFile || !selectedCourse) return;
                  try {
                    await uploadTemplate({
                      file: uploadedFile,
                      courseId: selectedCourse.id,
                    }).unwrap();
                    toast.success("Template uploaded successfully");
                    setShowUploadModal(false);
                    setUploadedFile(null);
                  } catch (error) {
                    toast.error("Failed to upload template");
                    console.error(error);
                  }
                }}
                disabled={!uploadedFile}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Template Modal */}
      {showViewTemplateModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-4xl p-6 shadow-2xl border border-white/50 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Certificate Template: {selectedCourse.title}
              </h3>
              <button
                onClick={() => setShowViewTemplateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 rounded-xl p-4 flex flex-col items-center min-h-[400px]">
              {/* Template Selector */}
              <div className="flex gap-4 mb-6 sticky top-0 z-50 py-2 bg-gray-100 w-full justify-center shadow-sm">
                <button
                  onClick={() => setSelectedTemplate("template1")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTemplate === "template1"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Classic Template
                </button>
                <button
                  onClick={() => setSelectedTemplate("template2")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTemplate === "template2"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Modern Template
                </button>
              </div>

              {/* Template Preview */}
              <div className="w-full max-w-3xl bg-white shadow-2xl">
                {selectedTemplate === "template1" ? (
                  <CertificateTemplate1
                    studentName="John Doe"
                    courseName={selectedCourse.title}
                    courseDescription={
                      (
                        selectedCourse.certificateDescription ||
                        selectedCourse.description ||
                        "For successfully completing the comprehensive course curriculum and demonstrating proficiency in the subject matter."
                      ).substring(0, MAX_DESCRIPTION_LENGTH) +
                      ((
                        selectedCourse.certificateDescription ||
                        selectedCourse.description ||
                        ""
                      ).length > MAX_DESCRIPTION_LENGTH
                        ? "..."
                        : "")
                    }
                    issueDate={new Date().toLocaleDateString()}
                    instructorName={
                      selectedCourse.instructorName || "Instructor Name"
                    }
                  />
                ) : (
                  <CertificateTemplate2
                    studentName="John Doe"
                    courseName={selectedCourse.title}
                    courseDescription={
                      (
                        selectedCourse.certificateDescription ||
                        selectedCourse.description ||
                        "For successfully completing the comprehensive course curriculum and demonstrating proficiency in the subject matter."
                      ).substring(0, MAX_DESCRIPTION_LENGTH) +
                      ((
                        selectedCourse.certificateDescription ||
                        selectedCourse.description ||
                        ""
                      ).length > MAX_DESCRIPTION_LENGTH
                        ? "..."
                        : "")
                    }
                    issueDate={new Date().toLocaleDateString()}
                    instructorName={
                      selectedCourse.instructorName || "Instructor Name"
                    }
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowViewTemplateModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (!selectedCourse) return;
                  try {
                    await updateCourse({
                      id: selectedCourse.id.toString(),
                      templateType: selectedTemplate,
                    }).unwrap();
                    toast.success("Template preference saved");
                    setShowViewTemplateModal(false);
                  } catch (error) {
                    toast.error("Failed to save template preference");
                    console.error(error);
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Approved Certificate Modal */}
      {showViewCertificateModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-5xl p-6 shadow-2xl border border-white/50 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Certificate of Completion
              </h3>
              <button
                onClick={() => setShowViewCertificateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 rounded-xl p-4 flex items-center justify-center min-h-[400px]">
              <div className="w-full max-w-3xl bg-white shadow-2xl transform scale-95">
                <CertificateTemplate1
                  studentName={`${selectedRequest.student.user.firstName} ${selectedRequest.student.user.lastName}`}
                  courseName={
                    endedCourses.find(
                      (c: any) => c.id === selectedRequest.courseId
                    )?.title || "Course Name"
                  }
                  courseDescription={
                    (
                      selectedRequest.description ||
                      endedCourses.find(
                        (c: any) => c.id === selectedRequest.courseId
                      )?.certificateDescription ||
                      endedCourses.find(
                        (c: any) => c.id === selectedRequest.courseId
                      )?.description ||
                      "For successfully completing the comprehensive course curriculum and demonstrating proficiency in the subject matter."
                    ).substring(0, MAX_DESCRIPTION_LENGTH) +
                    ((
                      selectedRequest.description ||
                      endedCourses.find(
                        (c: any) => c.id === selectedRequest.courseId
                      )?.certificateDescription ||
                      endedCourses.find(
                        (c: any) => c.id === selectedRequest.courseId
                      )?.description ||
                      ""
                    ).length > MAX_DESCRIPTION_LENGTH
                      ? "..."
                      : "")
                  }
                  issueDate={
                    selectedRequest.issueDate
                      ? new Date(selectedRequest.issueDate).toLocaleDateString()
                      : new Date().toLocaleDateString()
                  }
                  certificateNumber={
                    selectedRequest.certificateNumber || undefined
                  }
                  instructorName={
                    endedCourses.find(
                      (c: any) => c.id === selectedRequest.courseId
                    )?.instructorName || "Instructor Name"
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowViewCertificateModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md p-6 shadow-2xl border border-white/50 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Request Details
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedRequest.student.user.profile?.avatar ||
                    "https://via.placeholder.com/48"
                  }
                  alt={selectedRequest.student.user.firstName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedRequest.student.user.firstName}{" "}
                    {selectedRequest.student.user.lastName}
                  </h4>
                  <p className="text-gray-500 text-sm">Student</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 flex justify-center">
                      <FaUsers className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Email
                      </p>
                      <p className="font-medium">
                        {selectedRequest.student.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 flex justify-center">
                      <FaClock className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Requested On
                      </p>
                      <p className="font-medium">
                        {new Date(
                          selectedRequest.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.certificateNumber && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 flex justify-center">
                        <FaCertificate className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Certificate Number
                        </p>
                        <p className="font-medium font-mono text-blue-600">
                          #{selectedRequest.certificateNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 flex justify-center">
                      <FaBook className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Course
                      </p>
                      <p className="font-medium">
                        {endedCourses.find(
                          (c: any) => c.id === selectedRequest.courseId
                        )?.title || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 flex justify-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedRequest.status === "APPROVED"
                            ? "bg-green-500"
                            : selectedRequest.status === "PENDING"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Status
                      </p>
                      <p className="font-medium capitalize">
                        {selectedRequest.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedRequest.status === "APPROVED" &&
                  selectedRequest.issueDate && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <div className="flex items-center gap-3 text-green-800">
                        <FaCheck className="text-green-600" />
                        <div>
                          <p className="text-xs text-green-600 uppercase font-semibold">
                            Approved On
                          </p>
                          <p className="font-medium">
                            {new Date(
                              selectedRequest.issueDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {selectedRequest.status === "REJECTED" &&
                  selectedRequest.rejectionReason && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <div className="flex items-start gap-3 text-red-800">
                        <FaTimes className="text-red-600 mt-1" />
                        <div>
                          <p className="text-xs text-red-600 uppercase font-semibold">
                            Rejection Reason
                          </p>
                          <p className="font-medium">
                            {selectedRequest.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
