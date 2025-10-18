import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaTrash,
  FaDownload,
  FaCheck,
  FaTimes,
  FaClock,
  FaGraduationCap,
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
  FaAmazon
} from "react-icons/fa";
import { MdVerified, MdPending, MdClose } from "react-icons/md";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
interface Course {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  passingGrade: number;
  color: string;
  category: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  enrolledDate: string;
}

interface CourseProgress {
  id: string;
  studentId: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  finalGrade: number;
  completedDate: string;
  status: "in_progress" | "completed" | "failed";
}

interface CertificateRequest {
  id: string;
  studentId: string;
  courseId: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  certificateUrl?: string;
  certificateNumber?: string;
}

type TabType = "pending" | "approved" | "rejected" | "all";

const CertificateManagement = () => {
  // Mock data
  const [students] = useState<Student[]>([
    {
      id: "1",
      name: "Rukundo Patrick",
      email: "patrick@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      enrolledDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Uwimana Sarah",
      email: "sarah@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
      enrolledDate: "2024-02-20",
    },
    {
      id: "3",
      name: "Nkurunziza Jean",
      email: "jean@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      enrolledDate: "2024-01-30",
    },
    {
      id: "4",
      name: "Mutesi Grace",
      email: "grace@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=4",
      enrolledDate: "2024-03-10",
    },
    {
      id: "5",
      name: "Habimana David",
      email: "david@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      enrolledDate: "2024-03-15",
    },
    {
      id: "6",
      name: "Nyiramana Alice",
      email: "alice@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=6",
      enrolledDate: "2024-04-01",
    },
  ]);

  const [courses] = useState<Course[]>([
    {
      id: "1",
      title: "Advanced Thermodynamics",
      description:
        "Complete course on thermodynamic principles and applications",
      totalLessons: 20,
      passingGrade: 70,
      color: "from-blue-500 to-indigo-600",
      category: "Physics",
    },
    {
      id: "2",
      title: "Quantum Physics Fundamentals",
      description: "Introduction to quantum mechanics and modern physics",
      totalLessons: 15,
      passingGrade: 75,
      color: "from-purple-500 to-pink-600",
      category: "Physics",
    },
    {
      id: "3",
      title: "Machine Learning Essentials",
      description: "Core concepts of machine learning and data science",
      totalLessons: 25,
      passingGrade: 80,
      color: "from-green-500 to-emerald-600",
      category: "Computer Science",
    },
    {
      id: "4",
      title: "Organic Chemistry",
      description: "Comprehensive study of organic compounds and reactions",
      totalLessons: 30,
      passingGrade: 75,
      color: "from-orange-500 to-red-600",
      category: "Chemistry",
    },
  ]);

  const TabButton = ({
    tab,
    label,
    icon: Icon,
    color,
  }: {
    tab: TabType;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
  }) => (
    <button
      onClick={() => setSelectedTab(tab)}
      className={`flex items-center w-full gap-3 px-4 py-3 cursor-pointer rounded-md border-slate-400 border font-semibold transition-all duration-300 ${
        selectedTab === tab
          ? `bg-gradient-to-r ${color} border-slate-400 border text-white shadow-md transform scale-105`
          : "bg-white text-gray-600  hover:shadow-md"
      }`}
    >
      <Icon className="text-lg sm:hidden block" />
      <span className="">{label}</span>
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          selectedTab === tab
            ? "bg-white bg-opacity-20 text-black"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {tabCounts[tab]}
      </span>
    </button>
  );

  const CertificatesCarousel: React.FC = () => {
    return (
      <div className="mb-6 flex flex-col gap-5">
      
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TabButton
            tab="all"
            label="Certificates"
            icon={FaCertificate}
            color="bg-[#034153]"
          />
          <TabButton
            tab="pending"
            label="Awaiting"
            icon={FaClock}
            color="bg-yellow-500"
          />
          <TabButton
            tab="approved"
            label="Approved"
            icon={FaCheckCircle}
            color="from-green-500 to-green-600"
          />
          <TabButton
            tab="rejected"
            label="Rejected"
            icon={FaTimesCircle}
            color="from-red-500 to-red-600"
          />
        </div>
             {/* Request Counts */}
             <div className="flex gap-3 items-center">
                        <div className="flex h-3 gap-[3px] items-baseline">
                          <div className="bg-black w-2 h-2 rounded-full"></div>
                          <div className="text-md font-semibold text-gray-700 ">
                            Total
                          </div>
                        </div>
                        <div className="flex h-3 gap-[3px] items-baseline ">
                          <div className="bg-yellow-300  w-2 h-2 rounded-full"></div>
                          <div className="text-md font-semibold text-gray-700 ">
                            Pending
                          </div>
                        </div>
                    
                       
                          <div className="flex h-3 gap-[3px] items-baseline">
                            <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                            <div className="text-md font-semibold text-gray-700 ">
                              Approved
                            </div>
                          </div>
                    
                          <div className="flex h-3 gap-[3px] items-baseline">
                            <div className="bg-red-400 w-2 h-2 rounded-full"></div>
                            <div className="text-md font-semibold text-gray-700 ">
                             Rejected
                            </div>
                          </div>
                      </div>
      </div>
    );
  };

  const [courseProgress] = useState<CourseProgress[]>([
    // Advanced Thermodynamics
    {
      id: "1",
      studentId: "1",
      courseId: "1",
      completedLessons: 20,
      totalLessons: 20,
      finalGrade: 85,
      completedDate: "2024-07-15",
      status: "completed",
    },
    {
      id: "2",
      studentId: "2",
      courseId: "1",
      completedLessons: 20,
      totalLessons: 20,
      finalGrade: 92,
      completedDate: "2024-07-20",
      status: "completed",
    },
    {
      id: "3",
      studentId: "3",
      courseId: "1",
      completedLessons: 20,
      totalLessons: 20,
      finalGrade: 78,
      completedDate: "2024-08-10",
      status: "completed",
    },
    // Quantum Physics
    {
      id: "4",
      studentId: "4",
      courseId: "2",
      completedLessons: 15,
      totalLessons: 15,
      finalGrade: 88,
      completedDate: "2024-08-01",
      status: "completed",
    },
    {
      id: "5",
      studentId: "5",
      courseId: "2",
      completedLessons: 15,
      totalLessons: 15,
      finalGrade: 82,
      completedDate: "2024-08-05",
      status: "completed",
    },
    // Machine Learning
    {
      id: "6",
      studentId: "1",
      courseId: "3",
      completedLessons: 25,
      totalLessons: 25,
      finalGrade: 94,
      completedDate: "2024-08-12",
      status: "completed",
    },
    {
      id: "7",
      studentId: "6",
      courseId: "3",
      completedLessons: 25,
      totalLessons: 25,
      finalGrade: 87,
      completedDate: "2024-08-15",
      status: "completed",
    },
    // Organic Chemistry
    {
      id: "8",
      studentId: "2",
      courseId: "4",
      completedLessons: 30,
      totalLessons: 30,
      finalGrade: 91,
      completedDate: "2024-08-18",
      status: "completed",
    },
  ]);

  const [certificateRequests, setCertificateRequests] = useState<
    CertificateRequest[]
  >([
    // Advanced Thermodynamics requests
    {
      id: "1",
      studentId: "1",
      courseId: "1",
      requestDate: "2024-07-16",
      status: "approved",
      approvedBy: "Admin",
      approvedDate: "2024-07-17",
      certificateUrl: "/certificates/cert-001.pdf",
      certificateNumber: "CERT-2024-001",
    },
    {
      id: "2",
      studentId: "2",
      courseId: "1",
      requestDate: "2024-07-21",
      status: "pending",
    },
    {
      id: "3",
      studentId: "3",
      courseId: "1",
      requestDate: "2024-08-11",
      status: "rejected",
      rejectionReason: "Grade verification needed",
    },
    // Quantum Physics requests
    {
      id: "4",
      studentId: "4",
      courseId: "2",
      requestDate: "2024-08-02",
      status: "approved",
      approvedBy: "Admin",
      approvedDate: "2024-08-03",
      certificateUrl: "/certificates/cert-002.pdf",
      certificateNumber: "CERT-2024-002",
    },
    {
      id: "5",
      studentId: "5",
      courseId: "2",
      requestDate: "2024-08-06",
      status: "pending",
    },
    // Machine Learning requests
    {
      id: "6",
      studentId: "1",
      courseId: "3",
      requestDate: "2024-08-13",
      status: "approved",
      approvedBy: "Admin",
      approvedDate: "2024-08-14",
      certificateUrl: "/certificates/cert-003.pdf",
      certificateNumber: "CERT-2024-003",
    },
    {
      id: "7",
      studentId: "6",
      courseId: "3",
      requestDate: "2024-08-16",
      status: "pending",
    },
    // Organic Chemistry requests
    {
      id: "8",
      studentId: "2",
      courseId: "4",
      requestDate: "2024-08-19",
      status: "pending",
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<TabType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<CertificateRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );

  // Toggle course expansion
  const toggleCourseExpansion = (courseId: string) => {
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
  const approveCertificate = (requestId: string) => {
    setCertificateRequests((prev) =>
      prev.map((request) => {
        if (request.id === requestId) {
          const certificateNumber = generateCertificateNumber();
          return {
            ...request,
            status: "approved" as const,
            approvedBy: "Admin",
            approvedDate: new Date().toISOString().split("T")[0],
            certificateUrl: `/certificates/${certificateNumber.toLowerCase()}.pdf`,
            certificateNumber,
          };
        }
        return request;
      })
    );
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  // Reject certificate request
  const rejectCertificate = (requestId: string, reason: string) => {
    setCertificateRequests((prev) =>
      prev.map((request) => {
        if (request.id === requestId) {
          return {
            ...request,
            status: "rejected" as const,
            rejectionReason: reason,
          };
        }
        return request;
      })
    );
    setShowRejectionModal(false);
    setSelectedRequest(null);
    setRejectionReason("");
  };

  // Get course data with certificate requests
  const getCoursesWithRequests = () => {
    return courses
      .map((course) => {
        const requests = certificateRequests.filter((req) => {
          const matchesCourse = req.courseId === course.id;
          const matchesTab =
            selectedTab === "all" || req.status === selectedTab;
          return matchesCourse && matchesTab;
        });

        const filteredRequests = requests.filter((req) => {
          const student = students.find((s) => s.id === req.studentId);
          const progress = courseProgress.find(
            (p) => p.studentId === req.studentId && p.courseId === req.courseId
          );

          const searchLower = searchTerm.toLowerCase();
          return (
            !searchTerm ||
            student?.name.toLowerCase().includes(searchLower) ||
            student?.email.toLowerCase().includes(searchLower) ||
            course.title.toLowerCase().includes(searchLower)
          );
        });

        const requestsWithDetails = filteredRequests.map((request) => {
          const student = students.find((s) => s.id === request.studentId);
          const progress = courseProgress.find(
            (p) =>
              p.studentId === request.studentId &&
              p.courseId === request.courseId
          );
          return { request, student, progress };
        });

        const counts = {
          pending: requests.filter((r) => r.status === "pending").length,
          approved: requests.filter((r) => r.status === "approved").length,
          rejected: requests.filter((r) => r.status === "rejected").length,
          total: requests.length,
        };

        return {
          course,
          requests: requestsWithDetails,
          counts,
          hasRequests: requests.length > 0,
        };
      })
      .filter(
        (courseData) =>
          courseData.hasRequests || searchTerm || selectedTab === "all"
      );
  };

  // Tab counts
  const tabCounts = {
    all: certificateRequests.length,
    pending: certificateRequests.filter((r) => r.status === "pending").length,
    approved: certificateRequests.filter((r) => r.status === "approved").length,
    rejected: certificateRequests.filter((r) => r.status === "rejected").length,
  };

  const coursesData = getCoursesWithRequests();
  const [actions, setActions] = useState<string | null>(null);

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
                          {course.passingGrade}% passing grade
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
                      requests.map(({ request, student, progress }, index) => (
                        <div
                          key={index}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={
                                    student?.avatarUrl ||
                                    "https://via.placeholder.com/48"
                                  }
                                  alt={student?.name}
                                  className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                                />
                                <div
                                  className={`absolute -bottom-1 -right-1 rounded-full p-1.5 ${
                                    request?.status === "approved"
                                      ? "bg-green-500 text-white"
                                      : request?.status === "pending"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-red-500 text-white"
                                  }`}
                                >
                                  {request?.status === "approved" && (
                                    <FaCheck className="text-sm" />
                                  )}
                                  {request?.status === "pending" && (
                                    <FaClock className="text-sm" />
                                  )}
                                  {request?.status === "rejected" && (
                                    <FaTimes className="text-sm" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 relative items-center sm:flex">
                                <div className="">
                                  <h3 className="font-bold text-lg text-gray-900">
                                    {student?.name}
                                  </h3>
                                  <p className="text-gray-600">
                                    {student?.email}
                                  </p>
                                </div>

                                {actions === request.id && (
                                  <div className="dropdown-container absolute -top-30 left-20 z-20  p-3 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64">
                                    <div className="flex flex-col gap-2 text-sm">
                                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                        <FaCalendar className="text-gray-500" />
                                        Requested: {request?.requestDate}
                                      </span>
                                      {progress && (
                                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                          <FaGraduationCap /> Grade:{" "}
                                          {progress.finalGrade}%
                                        </span>
                                      )}
                                      {request?.certificateNumber && (
                                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                                          #{request.certificateNumber}
                                        </span>
                                      )}
                                      {request?.rejectionReason && (
                                        <span className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm">
                                          <strong>Rejection reason:</strong>{" "}
                                          {request.rejectionReason}
                                        </span>
                                      )}
                                      {request?.approvedDate && (
                                        <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm">
                                          <strong>Approved on:</strong>{" "}
                                          {request.approvedDate} by{" "}
                                          {request.approvedBy}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {request?.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowApprovalModal(true);
                                    }}
                                    className="bg-gradient-to-r cursor-pointer from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm"
                                  >
                                    <FaCheck />
                                    <span className="sm:block hidden">Approve</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowRejectionModal(true);
                                    }}
                                    className="bg-gradient-to-r cursor-pointer from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm"
                                  >
                                    <FaTimes />
                                    <span className="sm:block hidden">Reject</span>
                                  </button>
                                </>
                              )}
                              {request?.status === "approved" &&
                                request.certificateUrl && (
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
                                  setActions(actions === request.id ? null : request.id);
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
