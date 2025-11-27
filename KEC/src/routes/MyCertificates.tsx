import React, { useState, useEffect } from "react";
import {
  FaCertificate,
  FaCheck,
  FaTimes,
  FaClock,
  FaDownload,
  FaEye,
  FaEllipsisV,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useGetCertificatesQuery } from "../state/api/certificateApi";
import { CertificateTemplate1 } from "../Components/Certificate/CertificateTemplates";

// Types
interface Certificate {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  issueDate: string | null;
  certificateNumber?: string;
  rejectionReason?: string;
  description?: string | null;
  createdAt: string;
  student?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  course: {
    id: number;
    title: string;
    description: string;
    image_url: string;
    uploader?: {
      firstName: string;
      lastName: string;
    };
  };
}

const MyCertificates: React.FC = () => {
  const { data: certificates = [], isLoading } = useGetCertificatesQuery();
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeMenuId !== null &&
        !(event.target as Element).closest(".menu-container")
      ) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Debug logging
  console.log("Certificates data:", certificates);

  // Filter certificates by status
  const approvedCertificates = certificates.filter(
    (cert) => cert.status === "APPROVED"
  );
  const pendingCertificates = certificates.filter(
    (cert) => cert.status === "PENDING"
  );
  const rejectedCertificates = certificates.filter(
    (cert) => cert.status === "REJECTED"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleDownload = async (cert: Certificate) => {
    console.log("Starting download for:", cert.course.title);
    setIsDownloading(true);
    try {
      // We need to render the certificate in a hidden container to capture it
      // For now, we'll use the modal's certificate view if it's open, or we might need a hidden ref
      // A better approach for "Download" from the list is to set a temporary state to render the cert hidden, then capture it.

      // Let's use the selectedCertificate state to render a hidden version if not already viewing
      if (!selectedCertificate || selectedCertificate.id !== cert.id) {
        console.log("Setting selected certificate for download...");
        setSelectedCertificate(cert);
      }

      // Wait for state update and render
      console.log("Waiting for render...");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Increased timeout

      const element = certificateRef.current;
      if (!element) {
        console.error("Certificate element not found (ref is null)");
        alert(
          "Could not generate certificate. Please try opening the view modal first."
        );
        return;
      }
      console.log("Certificate element found:", element);

      console.log("Starting html2canvas capture...");
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        logging: true, // Enable html2canvas logging
        useCORS: true, // Important for images
        backgroundColor: "#ffffff",
        allowTaint: true,
      });
      console.log("Canvas captured successfully");

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${cert.course.title.replace(/\s+/g, "_")}_Certificate.pdf`);
      console.log("PDF saved");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsDownloading(false);
      // If we opened it just for download and weren't viewing it, we might want to clear selection
      // But keeping it selected is fine/safer to avoid flickering
    }
  };

  const renderCertificateCard = (cert: Certificate) => {
    const statusConfig = {
      APPROVED: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: <FaCheck className="text-green-500" />,
        label: "Approved",
      },
      PENDING: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        icon: <FaClock className="text-yellow-500" />,
        label: "Pending Review",
      },
      REJECTED: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: <FaTimes className="text-red-500" />,
        label: "Rejected",
      },
    };

    const config = statusConfig[cert.status];

    return (
      <div
        key={cert.id}
        className={`${config.bg} border ${config.border} rounded-xl p-4 hover:shadow-md transition-all duration-300 relative`}
      >
        <div className="flex items-start gap-3">
          <img
            src={cert.course.image_url || "/images/default-course.png"}
            alt={cert.course.title}
            className="w-14 h-14 rounded-lg object-cover border border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-800 leading-tight mb-1 truncate pr-2">
                  {cert.course.title}
                </h3>
                {cert.issueDate && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Issued:</span>{" "}
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}
                >
                  <span className="text-xs">{config.icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wide">
                    {config.label}
                  </span>
                </div>

                {cert.status === "APPROVED" && (
                  <div className="relative menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === cert.id ? null : cert.id
                        );
                      }}
                      className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-gray-500"
                    >
                      <FaEllipsisV className="text-sm" />
                    </button>

                    {activeMenuId === cert.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden">
                        <button
                          onClick={() => {
                            setSelectedCertificate(cert);
                            setShowViewModal(true);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"
                        >
                          <FaEye className="text-blue-500" />
                          View
                        </button>
                        <button
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"
                          onClick={() => {
                            handleDownload(cert);
                            setActiveMenuId(null);
                          }}
                          disabled={isDownloading}
                        >
                          <FaDownload className="text-green-500" />
                          {isDownloading ? "Downloading..." : "Download"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {cert.rejectionReason && (
              <div className="mt-2 p-2 bg-red-100/50 rounded text-xs text-red-800">
                <span className="font-semibold">Reason:</span>{" "}
                {cert.rejectionReason}
              </div>
            )}

            {cert.status === "PENDING" && (
              <p className="text-xs text-gray-500 mt-1 italic">
                Review in progress...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FaCertificate className="text-blue-600" />
            My Certificates
          </h1>
          <p className="text-gray-600">
            View and manage all your course certificates
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-800">
                  {approvedCertificates.length}
                </p>
              </div>
              <FaCheck className="text-3xl text-green-500" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {pendingCertificates.length}
                </p>
              </div>
              <FaClock className="text-3xl text-yellow-500" />
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-800">
                  {certificates.length}
                </p>
              </div>
              <FaCertificate className="text-3xl text-gray-400" />
            </div>
          </div>
        </div>

        {/* Certificates List */}
        {certificates.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-16 text-center">
            <FaCertificate className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              No certificates yet
            </h3>
            <p className="text-gray-400">
              Complete courses to earn your certificates
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Approved Certificates */}
            {approvedCertificates.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  Approved Certificates ({approvedCertificates.length})
                </h2>
                <div className="space-y-4">
                  {approvedCertificates.map(renderCertificateCard)}
                </div>
              </div>
            )}

            {/* Pending Certificates */}
            {pendingCertificates.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaClock className="text-yellow-500" />
                  Pending Review ({pendingCertificates.length})
                </h2>
                <div className="space-y-4">
                  {pendingCertificates.map(renderCertificateCard)}
                </div>
              </div>
            )}

            {/* Rejected Certificates */}
            {rejectedCertificates.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTimes className="text-red-500" />
                  Rejected ({rejectedCertificates.length})
                </h2>
                <div className="space-y-4">
                  {rejectedCertificates.map(renderCertificateCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Certificate Modal */}
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-5xl p-6 shadow-2xl border border-white/50 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Certificate of Completion
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-100 rounded-xl p-4">
              <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl">
                <CertificateTemplate1
                  studentName={
                    selectedCertificate.student?.user
                      ? `${selectedCertificate.student.user.firstName} ${selectedCertificate.student.user.lastName}`
                      : "Student Name"
                  }
                  courseName={selectedCertificate.course.title}
                  courseDescription={
                    selectedCertificate.description ||
                    selectedCertificate.course.description ||
                    "For successfully completing the comprehensive course curriculum and demonstrating proficiency in the subject matter."
                  }
                  issueDate={
                    selectedCertificate.issueDate
                      ? new Date(
                          selectedCertificate.issueDate
                        ).toLocaleDateString()
                      : new Date().toLocaleDateString()
                  }
                  certificateNumber={selectedCertificate.certificateNumber}
                  instructorName={
                    selectedCertificate.course.uploader
                      ? `${selectedCertificate.course.uploader.firstName} ${selectedCertificate.course.uploader.lastName}`.trim()
                      : "Instructor"
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() =>
                  selectedCertificate && handleDownload(selectedCertificate)
                }
                disabled={isDownloading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload />{" "}
                {isDownloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden Certificate for PDF Generation */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        {selectedCertificate && (
          <div
            ref={certificateRef}
            style={{ width: "1123px", height: "794px" }}
          >
            {/* A4 dimensions at 96 DPI approx, or just a fixed large size */}
            <CertificateTemplate1
              studentName={
                selectedCertificate.student?.user
                  ? `${selectedCertificate.student.user.firstName} ${selectedCertificate.student.user.lastName}`
                  : "Student Name"
              }
              courseName={selectedCertificate.course.title}
              courseDescription={
                selectedCertificate.description ||
                selectedCertificate.course.description ||
                "For successfully completing the comprehensive course curriculum and demonstrating proficiency in the subject matter."
              }
              issueDate={
                selectedCertificate.issueDate
                  ? new Date(selectedCertificate.issueDate).toLocaleDateString()
                  : new Date().toLocaleDateString()
              }
              certificateNumber={selectedCertificate.certificateNumber}
              instructorName={
                selectedCertificate.course.uploader
                  ? `${selectedCertificate.course.uploader.firstName} ${selectedCertificate.course.uploader.lastName}`.trim()
                  : "Instructor"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificates;
