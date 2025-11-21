import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, X, FileImage, Check } from "lucide-react";

interface StudentMarksUploaderProps {
  studentName: string;
  existingFileUrl?: string;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const StudentMarksUploader: React.FC<StudentMarksUploaderProps> = ({
  studentName,
  existingFileUrl,
  onFileSelect,
  disabled = false,
}) => {
  const getFullUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;

    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    // Ensure no double slashes
    const cleanBackendUrl = backendUrl.endsWith("/")
      ? backendUrl.slice(0, -1)
      : backendUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;

    return `${cleanBackendUrl}${cleanUrl}`;
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getFullUrl(existingFileUrl)
  );
  const [file, setFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Update preview if existingFileUrl changes (e.g. after save)
    if (existingFileUrl && !file) {
      setPreviewUrl(getFullUrl(existingFileUrl));
    }
  }, [existingFileUrl, file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type (images only)
      if (!selectedFile.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(selectedFile);
      setPreviewUrl(preview);
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    if (previewUrl && !existingFileUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFile(null);
    onFileSelect(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {previewUrl ? (
          <div className="flex items-center gap-2">
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowPreview(true)}
            >
              <img
                src={previewUrl}
                alt={`Marks for ${studentName}`}
                className="w-10 h-10 object-cover rounded-lg border border-white/50 shadow-md"
                onError={(e) => {
                  console.error("Image load error:", previewUrl);
                  e.currentTarget.src =
                    "https://via.placeholder.com/40?text=Err";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                <FileImage className="h-5 w-5 text-white" />
              </div>
            </div>
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
            {file && <Check className="h-4 w-4 text-green-600" />}
          </div>
        ) : (
          <label
            className={`flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50"
            }`}
          >
            <Upload className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Upload</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Image Preview Modal - Rendered via Portal */}
      {showPreview &&
        previewUrl &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowPreview(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt={`Marks for ${studentName}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
              />
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default StudentMarksUploader;
