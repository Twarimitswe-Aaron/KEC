import React, { useState } from "react";
import { X } from "lucide-react";
import { useGetCourseEnrollmentsQuery } from "../../state/api/courseApi";
import { useGenerateCertificatesMutation } from "../../state/api/certificateApi";
import { toast } from "react-toastify";

interface Props {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

const CertificateGenerationModal: React.FC<Props> = ({
  courseId,
  courseName,
  onClose,
}) => {
  const { data: enrollmentsData } = useGetCourseEnrollmentsQuery();
  const [generateCerts, { isLoading }] = useGenerateCertificatesMutation();
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Find enrollments for this specific course
  const courseEnrollment = enrollmentsData?.find((c) => c.id === courseId);
  const students = courseEnrollment?.students || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Extract student IDs - need to map from user IDs to student IDs
      setSelectedStudents(students.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleToggleStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleGenerate = async () => {
    try {
      const result = await generateCerts({
        courseId,
        studentIds: selectedStudents.length > 0 ? selectedStudents : undefined,
      }).unwrap();

      toast.success(result.message || "Certificates generated successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate certificates");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Generate Certificates
            </h2>
            <p className="text-sm text-white/70 mt-1">{courseName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70">
                No enrolled students found for this course.
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === students.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-white font-medium">
                    Select All ({students.length} students)
                  </span>
                </label>
              </div>

              {/* Student List */}
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleToggleStudent(student.id)}
                        className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{student.name}</p>
                        <p className="text-sm text-white/60">{student.email}</p>
                      </div>
                      {student.paid && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                          Paid
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <p className="text-sm text-white/70">
            {selectedStudents.length > 0
              ? `${selectedStudents.length} student${
                  selectedStudents.length > 1 ? "s" : ""
                } selected`
              : "Select students or generate for all"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading || students.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Certificates"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerationModal;
