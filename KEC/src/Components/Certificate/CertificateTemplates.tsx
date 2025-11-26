import React from "react";
import { FaAward, FaSignature } from "react-icons/fa";

interface TemplateProps {
  studentName: string;
  courseName: string;
  courseDescription: string;
  issueDate: string;
  instructorName?: string;
  certificateNumber?: string;
}

export const CertificateTemplate1: React.FC<TemplateProps> = ({
  studentName,
  courseName,
  courseDescription,
  issueDate,
  instructorName = "Instructor Name",
  certificateNumber,
}) => {
  return (
    <div
      className="w-full h-full bg-white p-8 text-center relative shadow-lg"
      style={{ minHeight: "600px", fontFamily: "'Times New Roman', serif" }}
    >
      {/* Border */}
      <div className="absolute inset-4 border-4 border-double border-yellow-600 pointer-events-none"></div>
      <div className="absolute inset-6 border border-yellow-600 pointer-events-none"></div>

      {/* Corner Ornaments */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-600"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-600"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-600"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-600"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full py-12 px-8">
        <div className="mb-8">
          <FaAward className="text-6xl text-yellow-600 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 tracking-wider uppercase mb-2">
            Certificate
          </h1>
          <h2 className="text-2xl text-gray-600 font-serif italic">
            of Completion
          </h2>
        </div>

        <div className="mb-8 w-full max-w-2xl">
          <p className="text-xl text-gray-600 mb-4">This is to certify that</p>
          <div className="text-4xl font-bold text-blue-900 border-b-2 border-gray-300 pb-2 mb-6 font-serif italic">
            {studentName}
          </div>
          <p className="text-xl text-gray-600 mb-4">
            has successfully completed the course
          </p>
          <div className="text-3xl font-bold text-gray-800 mb-4">
            {courseName}
          </div>
          <p className="text-gray-500 italic max-w-lg mx-auto leading-relaxed">
            {courseDescription}
          </p>
        </div>

        <div className="mt-auto w-full flex justify-between items-end px-12">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800 border-t border-gray-400 pt-2 px-8">
              {issueDate}
            </div>
            <p className="text-sm text-gray-500 mt-1">Date Issued</p>
          </div>

          <div className="w-24 h-24 opacity-20 flex flex-col items-center justify-center">
            {/* Seal Placeholder */}
            <div className="w-full h-full rounded-full border-4 border-yellow-600 flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-yellow-800 transform -rotate-12">
                OFFICIAL SEAL
              </span>
            </div>
            {certificateNumber && (
              <span className="text-[10px] text-gray-500 font-mono">
                #{certificateNumber}
              </span>
            )}
          </div>

          <div className="text-center">
            <div className="text-2xl font-script text-blue-900 mb-1 font-serif italic">
              {instructorName}
            </div>
            <div className="text-lg font-bold text-gray-800 border-t border-gray-400 pt-2 px-8">
              Instructor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CertificateTemplate2: React.FC<TemplateProps> = ({
  studentName,
  courseName,
  courseDescription,
  issueDate,
  instructorName = "Instructor Name",
  certificateNumber,
}) => {
  return (
    <div
      className="w-full h-full bg-slate-50 p-0 relative shadow-lg flex"
      style={{ minHeight: "600px", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Sidebar */}
      <div className="w-1/3 bg-blue-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-8 shadow-lg">
            <FaAward className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">CERTIFICATE</h1>
          <h2 className="text-xl text-blue-300 font-light tracking-widest uppercase">
            Of Achievement
          </h2>
        </div>

        <div className="relative z-10">
          <p className="text-blue-200 text-sm uppercase tracking-wider mb-2">
            Verified By
          </p>
          <div className="text-2xl font-bold mb-1">{instructorName}</div>
          <div className="h-0.5 w-12 bg-blue-500 mb-4"></div>
          <p className="text-blue-300 text-sm">Course Instructor</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-12 flex flex-col justify-center relative bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>

        <div className="relative z-10">
          <p className="text-gray-500 uppercase tracking-widest mb-6 text-sm font-semibold">
            Proudly Presented To
          </p>

          <h3 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {studentName}
          </h3>

          <p className="text-xl text-gray-600 mb-4">
            For the successful completion of
          </p>

          <h4 className="text-3xl font-bold text-blue-600 mb-6">
            {courseName}
          </h4>

          <p className="text-gray-500 leading-relaxed mb-12 max-w-lg">
            {courseDescription}
          </p>

          <div className="flex items-center gap-4">
            <div className="bg-gray-100 px-6 py-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="font-bold text-gray-900">{issueDate}</p>
            </div>
            {certificateNumber && (
              <div className="bg-blue-50 px-6 py-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-500 uppercase tracking-wider mb-1">
                  Certificate ID
                </p>
                <p className="font-bold text-blue-900">#{certificateNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
