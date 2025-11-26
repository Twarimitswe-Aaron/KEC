import React, { useRef } from "react";
import { Upload, Eye, Award, FileText, Calendar, Users } from "lucide-react";
import {
  CourseData,
  useUploadCourseTemplateMutation,
} from "../../state/api/courseApi";
import { toast } from "react-toastify";

interface CertificateCourseCardProps {
  course: CourseData;
  onGenerate: (courseId: number, courseName: string) => void;
}

const CertificateCourseCard: React.FC<CertificateCourseCardProps> = ({
  course,
  onGenerate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTemplate, { isLoading: isUploading }] =
    useUploadCourseTemplateMutation();

  const handleUploadTemplate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadTemplate({ id: course.id, file }).unwrap();
      toast.success("Template uploaded successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload template");
    }
  };

  const handleShowTemplate = () => {
    if (course.templateUrl) {
      window.open(course.templateUrl, "_blank");
    } else {
      toast.info("No template uploaded for this course");
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-gray-200/20 p-6 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-inner overflow-hidden">
            {course.image_url ? (
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {course.title}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {course.maximum || 0} Students
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(course.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full border border-amber-200/50">
          Stopped
        </div>
      </div>

      <div className="space-y-3">
        {/* Template Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Template"}
          </button>
          <button
            onClick={handleShowTemplate}
            disabled={!course.templateUrl}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            View Template
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => onGenerate(course.id, course.title)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 font-bold"
        >
          <Award className="w-5 h-5" />
          Generate Certificates
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm,.pdf,.png,.jpg,.jpeg"
        onChange={handleUploadTemplate}
        className="hidden"
      />
    </div>
  );
};

export default CertificateCourseCard;
