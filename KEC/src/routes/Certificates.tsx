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
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetEndedCoursesWithStudentsQuery,
  useUpdateCertificateStatusMutation,
} from "../state/api/certificateApi";

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
}

type TabType = "all" | "pending" | "approved" | "rejected";

// Component
const Certificates: React.FC = () => {
  // API hooks
  const { data: endedCourses = [], isLoading: isLoadingCourses } =
    useGetEndedCoursesWithStudentsQuery();
    console.log(endedCourses)
  const [updateStatus] = useUpdateCertificateStatusMutation();

  // State
  const [selectedTab, setSelectedTab] = useState<TabType>("all");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Certificate | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set()
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
  const approveCertificate = async (requestId: number) => {
    try {
      const certificateNumber = generateCertificateNumber();
      await updateStatus({
        id: requestId,
        status: "APPROVED",
        certificateNumber,
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
  const rejectCertificate = async (requestId: number, reason: string) => {
    try {
      await updateStatus({
        id: requestId,
        status: "REJECTED",
        rejectionReason: reason,
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
        description: "Course completed",
        passingGrade: 70,
      },
      requests: course.students.map((student: any) => ({
        id: student.id,
        status: "PENDING", // Default status for students in ended courses
        student: {
          user: {
            firstName: student.name.split(" ")[0] || "",
            lastName: student.name.split(" ").slice(1).join(" ") || "",
            email: student.email,
            profile: {
              avatar: null,
            },
          },
        },
        courseId: course.id,
        createdAt: new Date().toISOString(),
        certificateNumber: null,
        rejectionReason: null,
        issueDate: null,
      })),
      counts: {
        total: course.students.length,
        pending: course.students.length,
        approved: 0,
        rejected: 0,
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

  const [sortBy, setSortBy] = useState("newest");
  const [sortDirection, setSortDirection] = useState("asc");

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
    <div className="min-h-screen rounded-md bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
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
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Course Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-white/50 transition-all"
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
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {course.passingGrade || 70}% passing grade
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Request Counts */}
                      <div className="flex gap-3 items-center">
                        <div className="flex gap-1 items-center">
                          <div className="bg-gray-800 w-2.5 h-2.5 rounded-full"></div>
                          <span className="text-sm font-semibold text-gray-700">
                            {counts.total}
                          </span>
                        </div>
                        <div className="flex gap-1 items-center">
                          <div className="bg-yellow-400 w-2.5 h-2.5 rounded-full"></div>
                          <span className="text-sm font-semibold text-gray-700">
                            {counts.pending}
                          </span>
                        </div>
                        {counts.approved > 0 && (
                          <div className="flex gap-1 items-center">
                            <div className="bg-green-400 w-2.5 h-2.5 rounded-full"></div>
                            <span className="text-sm font-semibold text-gray-700">
                              {counts.approved}
                            </span>
                          </div>
                        )}
                        {counts.rejected > 0 && (
                          <div className="flex gap-1 items-center">
                            <div className="bg-red-400 w-2.5 h-2.5 rounded-full"></div>
                            <span className="text-sm font-semibold text-gray-700">
                              {counts.rejected}
                            </span>
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
                  <div className="bg-white/40 backdrop-blur-sm divide-y divide-gray-200/50">
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
                          className="p-5 hover:bg-white/60 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={
                                    request.student.user.profile?.avatar ||
                                    "https://via.placeholder.com/48"
                                  }
                                  alt={request.student.user.firstName}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div
                                  className={`absolute -bottom-1 -right-1 rounded-full p-1.5 ${
                                    request.status === "APPROVED"
                                      ? "bg-green-500"
                                      : request.status === "PENDING"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  } text-white shadow-md`}
                                >
                                  {request.status === "APPROVED" && (
                                    <FaCheck className="text-xs" />
                                  )}
                                  {request.status === "PENDING" && (
                                    <FaClock className="text-xs" />
                                  )}
                                  {request.status === "REJECTED" && (
                                    <FaTimes className="text-xs" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">
                                  {request.student.user.firstName}{" "}
                                  {request.student.user.lastName}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {request.student.user.email}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  {request.certificateNumber && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                      #{request.certificateNumber}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    Requested:{" "}
                                    {new Date(
                                      request.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {request.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowApprovalModal(true);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-medium text-sm flex items-center gap-2"
                                  >
                                    <FaCheck /> Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowRejectionModal(true);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium text-sm flex items-center gap-2"
                                  >
                                    <FaTimes /> Reject
                                  </button>
                                </>
                              )}
                              {request.status === "APPROVED" && (
                                <div className="flex gap-2">
                                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
                                    <FaEye className="text-lg" />
                                  </button>
                                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200">
                                    <FaDownload className="text-lg" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional Details */}
                          {(request.rejectionReason || request.issueDate) && (
                            <div className="mt-3 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg">
                              {request.rejectionReason && (
                                <p className="text-sm text-red-700">
                                  <strong>Rejection reason:</strong>{" "}
                                  {request.rejectionReason}
                                </p>
                              )}
                              {request.issueDate && (
                                <p className="text-sm text-green-700">
                                  <strong>Approved on:</strong>{" "}
                                  {new Date(
                                    request.issueDate
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
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
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md p-8 shadow-2xl border border-white/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Approve Certificate
              </h3>
              <p className="text-gray-600">
                Are you sure you want to approve this certificate request? This
                will generate a certificate for the student.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => approveCertificate(selectedRequest.id)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg"
              >
                Approve
              </button>
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
                onClick={() =>
                  rejectCertificate(selectedRequest.id, rejectionReason)
                }
                disabled={!rejectionReason.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
