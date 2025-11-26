import React, { useState, useRef } from "react";
import { MoreVertical, Upload, Eye, Award, Play, Square } from "lucide-react";
import {
  useStartCourseMutation,
  useStopCourseMutation,
  useUploadCourseTemplateMutation,
  useGetCourseTemplateQuery,
  CourseStatus,
} from "../state/api/courseApi";
import { toast } from "react-toastify";
import CertificateGenerationModal from "./Certificate/CertificateGenerationModal";

interface CourseActionsMenuProps {
  courseId: number;
  courseName: string;
  courseStatus?: CourseStatus;
  onRefresh?: () => void;
}

const CourseActionsMenu: React.FC<CourseActionsMenuProps> = ({
  courseId,
  courseName,
  courseStatus,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [startCourse, { isLoading: isStarting }] = useStartCourseMutation();
  const [stopCourse, { isLoading: isStopping }] = useStopCourseMutation();
  const [uploadTemplate, { isLoading: isUploading }] =
    useUploadCourseTemplateMutation();
  const { data: templateData } = useGetCourseTemplateQuery(courseId);

  const handleStartCourse = async () => {
    try {
      await startCourse(courseId).unwrap();
      toast.success("Course started successfully!");
      setIsOpen(false);
      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to start course");
    }
  };

  const handleStopCourse = async () => {
    try {
      await stopCourse(courseId).unwrap();
      toast.success("Course stopped successfully!");
      setIsOpen(false);
      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to stop course");
    }
  };

  const handleUploadTemplate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadTemplate({ id: courseId, file }).unwrap();
      toast.success("Template uploaded successfully!");
      setIsOpen(false);
      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload template");
    }
  };

  const handleShowTemplate = () => {
    if (templateData?.templateUrl) {
      window.open(templateData.templateUrl, "_blank");
      setIsOpen(false);
    } else {
      toast.info("No template uploaded for this course");
    }
  };

  const handleGenerateCertificates = () => {
    setShowCertModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        {/* Three Dots Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Course Actions"
        >
          <MoreVertical className="w-5 h-5 text-white" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl z-50 overflow-hidden">
              {/* Lifecycle Controls */}
              <div className="p-2 border-b border-white/10">
                <p className="px-3 py-2 text-xs text-white/50 font-semibold uppercase">
                  Course Lifecycle
                </p>
                {courseStatus === CourseStatus.ENDED ? (
                  <button
                    onClick={handleStartCourse}
                    disabled={isStarting}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isStarting ? "Starting..." : "Start Course"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopCourse}
                    disabled={isStopping}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" />
                    <span>{isStopping ? "Stopping..." : "Stop Course"}</span>
                  </button>
                )}
              </div>

              {/* Template Actions */}
              <div className="p-2 border-b border-white/10">
                <p className="px-3 py-2 text-xs text-white/50 font-semibold uppercase">
                  Certificate Template
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {isUploading ? "Uploading..." : "Upload Template"}
                  </span>
                </button>
                <button
                  onClick={handleShowTemplate}
                  disabled={!templateData?.templateUrl}
                  className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>Show Template</span>
                </button>
              </div>

              {/* Certificate Generation */}
              {courseStatus === CourseStatus.ENDED && (
                <div className="p-2">
                  <p className="px-3 py-2 text-xs text-white/50 font-semibold uppercase">
                    Certificates
                  </p>
                  <button
                    onClick={handleGenerateCertificates}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    <span>Generate Certificates</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.pdf,.png,.jpg,.jpeg"
          onChange={handleUploadTemplate}
          className="hidden"
        />
      </div>

      {/* Certificate Generation Modal */}
      {showCertModal && (
        <CertificateGenerationModal
          courseId={courseId}
          courseName={courseName}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </>
  );
};

export default CourseActionsMenu;
