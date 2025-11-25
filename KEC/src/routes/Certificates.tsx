import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaTrash,
  FaDownload,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaCalendar,
  FaSearch,
  FaFilter,
  FaBell,
  FaCertificate,
  FaBookOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaChevronDown,
  FaChevronRight,
  FaUsers,
  FaBook,
  FaAmazon,
} from "react-icons/fa";
import { MdVerified, MdPending, MdClose } from "react-icons/md";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  useGetCertificatesQuery,
  useUpdateCertificateStatusMutation,
  Certificate,
} from "../state/api/certificateApi";
import { toast } from "react-toastify";

type TabType = "pending" | "approved" | "rejected" | "all";

const CertificateManagement = () => {
  const { data: certificates = [], isLoading } = useGetCertificatesQuery();
  const [updateStatus] = useUpdateCertificateStatusMutation();

  const [selectedTab, setSelectedTab] = useState<TabType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Certificate | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set()
  );
  const [actions, setActions] = useState<number | null>(null);

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

  // Group certificates by course
  const getCoursesWithRequests = () => {
    const grouped = new Map<
      number,
      {
        course: Certificate["course"];
        requests: Certificate[];
        counts: {
          pending: number;
          approved: number;
          rejected: number;
          total: number;
        };
      }
    >();

    certificates.forEach((cert) => {
      // Filter by tab
      if (selectedTab !== "all" && cert.status.toLowerCase() !== selectedTab)
        return;

      // Filter by search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        cert.course.title.toLowerCase().includes(searchLower) ||
        `${cert.student.user.firstName} ${cert.student.user.lastName}`
          .toLowerCase()
          .includes(searchLower) ||
        cert.student.user.email.toLowerCase().includes(searchLower);

      if (!matchesSearch) return;

      if (!grouped.has(cert.courseId)) {
        grouped.set(cert.courseId, {
          course: cert.course,
          requests: [],
          counts: { pending: 0, approved: 0, rejected: 0, total: 0 },
        });
      }

      const group = grouped.get(cert.courseId)!;
      group.requests.push(cert);

      // Update counts (based on ALL certificates for this course, not just filtered ones?
      // Usually counts reflect the current view or total. Let's make them reflect the current view for now)
      group.counts.total++;
      if (cert.status === "PENDING") group.counts.pending++;
      else if (cert.status === "APPROVED") group.counts.approved++;
      else if (cert.status === "REJECTED") group.counts.rejected++;
    });

    return Array.from(grouped.values());
  };

  // Tab counts (global)
  const tabCounts = {
    all: certificates.length,
    pending: certificates.filter((r) => r.status === "PENDING").length,
    approved: certificates.filter((r) => r.status === "APPROVED").length,
    rejected: certificates.filter((r) => r.status === "REJECTED").length,
  };

  const coursesData = getCoursesWithRequests();

  const CertificatesCarousel: React.FC = () => {
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const filterOptions = [
      {
        value: "all",
        label: "All Certificates",
        icon: FaCertificate,
        count: tabCounts.all,
      },
      {
        value: "pending",
        label: "Pending",
        icon: FaClock,
        count: tabCounts.pending,
      },
      {
        value: "approved",
        label: "Approved",
        icon: FaCheckCircle,
        count: tabCounts.approved,
      },
      {
        value: "rejected",
        label: "Rejected",
        icon: FaTimesCircle,
        count: tabCounts.rejected,
      },
    ];

    const selectedFilter = filterOptions.find(
      (opt) => opt.value === selectedTab
    );
    const Icon = selectedFilter?.icon || FaFilter;

    return (
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FaFilter className="text-gray-600" />
            <span className="font-medium text-gray-700">
              {selectedFilter?.label || "Filter"}
            </span>
            <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
              {selectedFilter?.count || 0}
            </span>
            <FaChevronDown
              className={`text-gray-500 transition-transform ${
                showFilterDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {filterOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedTab(option.value as TabType);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedTab === option.value
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    } ${
                      option.value === filterOptions[0].value
                        ? "rounded-t-lg"
                        : ""
                    } ${
                      option.value ===
                      filterOptions[filterOptions.length - 1].value
                        ? "rounded-b-lg"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <OptionIcon
                        className={`${
                          option.value === "pending"
                            ? "text-yellow-500"
                            : option.value === "approved"
                            ? "text-green-500"
                            : option.value === "rejected"
                            ? "text-red-500"
                            : "text-blue-500"
                        }`}
                      />
                      <span className="font-medium text-gray-700">
                        {option.label}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Legend */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-1 items-center">
            <div className="bg-black w-2 h-2 rounded-full"></div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="flex gap-1 items-center">
            <div className="bg-yellow-400 w-2 h-2 rounded-full"></div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="flex gap-1 items-center">
            <div className="bg-green-400 w-2 h-2 rounded-full"></div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="flex gap-1 items-center">
            <div className="bg-red-400 w-2 h-2 rounded-full"></div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container') && !target.closest('.amazon-icon')) {
        setActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-md bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-3 py-3">
        <CertificatesCarousel />

        <div className="space-y-6">
          {coursesData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
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
                className="bg-white rounded-xl shadow-xl w-full overflow-hidden"
              >
                {/* Course Header */}
                <div
                  className={`  p-3 w-full   cursor-pointer hover:shadow-lg transition-all duration-300`}
                  onClick={() => toggleCourseExpansion(course.id)}
                >
                  <div className="  sm:flex py-3  block w-full  sm:justify-between text-white">
                    <div className="sm:w-[70%] w-full">
                      <h2 className="text-2xl text-black  font-semibold">
                        {course.title}
                      </h2>
                      <p className="text-black text-opacity-90 mt-1">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="bg-[#888ad627] text-black bg-opacity-20 px-3 py-1 rounded-full">
                          {course.passingGrade || 70}% passing grade
                        </span>
                      </div>
                    </div>

                    <div className="flex  sm:w-[30%] w-full  items-center justify-end gap-6">
                      {/* Request Counts */}
                      <div className="flex gap-3 items-center">
                        <div className="flex h-3 gap-[3px] items-baseline">
                          <div className="bg-black w-2 h-2 rounded-full"></div>
                          <div className="text-md text-black ">
                            {counts.total}
                          </div>
                        </div>
                        <div className="flex h-3 gap-[3px] items-baseline ">
                          <div className="bg-yellow-300  w-2 h-2 rounded-full"></div>
                          <div className="text-md text-black ">
                            {counts.pending}
                          </div>
                        </div>

                        {counts.approved > 0 && (
                          <div className="flex h-3 gap-[3px] items-baseline">
                            <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                            <div className="text-md  text-black ">
                              {counts.approved}
                            </div>
                          </div>
                        )}
                        {counts.rejected > 0 && (
                          <div className="flex h-3 gap-[3px] items-baseline">
                            <div className="bg-red-400 w-2 h-2 rounded-full"></div>
                            <div className="text-md text-black ">
                              {counts.rejected}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className="text-md text-black mt-3 transition-transform duration-300">
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
                  <div className="divide-y divide-gray-100">
                    {requests.length === 0 ? (
                      <div className="p-8 text-center">
                        <FaUsers className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">
                          No certificate requests for this course
                          {selectedTab !== "all" &&
                            ` with status: ${selectedTab}`}
                        </p>
                      </div>
                    ) : (
                      requests.map((request, index) => (
                        <div
                          key={index}
                          className="p-6 hover:bg-gray-50 transition-colors"
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
                                  className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                                />
                                <div
                                  className={`absolute -bottom-1 -right-1 rounded-full p-1.5 ${
                                    request.status === "APPROVED"
                                      ? "bg-green-500 text-white"
                                      : request.status === "PENDING"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-red-500 text-white"
                                  }`}
                                >
                                  {request.status === "APPROVED" && (
                                    <FaCheck className="text-sm" />
                                  )}
                                  {request.status === "PENDING" && (
                                    <FaClock className="text-sm" />
                                  )}
                                  {request.status === "REJECTED" && (
                                    <FaTimes className="text-sm" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 relative items-center sm:flex">
                                <div className="">
                                  <h3 className="font-bold text-lg text-gray-900">
                                    {request.student.user.firstName}{" "}
                                    {request.student.user.lastName}
                                  </h3>
                                  <p className="text-gray-600">
                                    {request.student.user.email}
                                  </p>
                                </div>

                                {actions === request.id && (
                                  <div className="dropdown-container absolute -top-30 left-20 z-20  p-3 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64">
                                    <div className="flex flex-col gap-2 text-sm">
                                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                        <FaCalendar className="text-gray-500" />
                                        Requested:{" "}
                                        {new Date(
                                          request.createdAt
                                        ).toLocaleDateString()}
                                      </span>

                                      {request.certificateNumber && (
                                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                                          #{request.certificateNumber}
                                        </span>
                                      )}
                                      {request.rejectionReason && (
                                        <span className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm">
                                          <strong>Rejection reason:</strong>{" "}
                                          {request.rejectionReason}
                                        </span>
                                      )}
                                      {request.issueDate && (
                                        <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm">
                                          <strong>Approved on:</strong>{" "}
                                          {new Date(
                                            request.issueDate
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {request.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowApprovalModal(true);
                                    }}
                                    className="bg-gradient-to-r cursor-pointer from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm"
                                  >
                                    <FaCheck />
                                    <span className="sm:block hidden">
                                      Approve
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowRejectionModal(true);
                                    }}
                                    className="bg-gradient-to-r cursor-pointer from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm"
                                  >
                                    <FaTimes />
                                    <span className="sm:block hidden">
                                      Reject
                                    </span>
                                  </button>
                                </>
                              )}
                              {request.status === "APPROVED" && (
                                <div className="flex gap-3">
                                  <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors border-2 border-blue-200 hover:border-blue-300">
                                    <FaEye className="text-lg" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors border-2 border-green-200 hover:border-green-300">
                                    <FaDownload className="text-lg" />
                                  </button>
                                </div>
                              )}
                              <FaAmazon
                                onClick={() => {
                                  setActions(
                                    actions === request.id ? null : request.id
                                  );
                                }}
                                className="amazon-icon cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                              />
                            </div>
                          </div>
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
        <div className="fixed inset-0 bg-[#00000090]  flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
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
                className="flex-1 cursor-pointer px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => approveCertificate(selectedRequest.id)}
                className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-[#00000080]  flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
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
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  rejectCertificate(selectedRequest.id, rejectionReason)
                }
                disabled={!rejectionReason.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CertificateManagement;
