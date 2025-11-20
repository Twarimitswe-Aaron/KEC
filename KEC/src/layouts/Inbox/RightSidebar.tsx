import React from "react";
import { useChat } from "../../hooks/useChat";

const RightSidebar = () => {
  const { activeChat, messages } = useChat();
  const [expandedSection, setExpandedSection] = React.useState<
    "photos" | "docs" | "others" | null
  >(null);

  // Helper to check file type
  const getFileType = (fileName: string = "") => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const docExtensions = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
      "rtf",
    ];
    if (docExtensions.includes(extension)) return "document";
    return "other";
  };

  // Filter messages for files and images
  // Sort by createdAt descending to show latest first
  // Deduplicate messages by ID to prevent key collisions
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set();
    return messages.filter((msg) => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  const sortedMessages = [...uniqueMessages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const sharedPhotos = sortedMessages.filter(
    (msg) => msg.messageType === "IMAGE"
  );
  const allFiles = sortedMessages.filter((msg) => msg.messageType === "FILE");

  const sharedDocuments = allFiles.filter(
    (msg) => getFileType(msg.fileName) === "document"
  );
  const sharedOthers = allFiles.filter(
    (msg) => getFileType(msg.fileName) === "other"
  );

  const toggleSection = (section: "photos" | "docs" | "others") => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  if (!activeChat) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a chat to view shared files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Media & Files
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {sharedPhotos.length + allFiles.length} items shared
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Shared Photos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Photos ({sharedPhotos.length})
            </h4>
            {sharedPhotos.length > 6 && (
              <button
                onClick={() => toggleSection("photos")}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none transition-colors duration-200"
              >
                {expandedSection === "photos" ? "Show Less" : "Show All"}
              </button>
            )}
          </div>

          {sharedPhotos.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {sharedPhotos.slice(0, 6).map((message, index) => (
                  <div
                    key={`${message.id}-${message.createdAt}-${index}`}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group"
                  >
                    <img
                      src={(() => {
                        let imageUrl =
                          message.fileUrl || "/images/default-image.png";
                        if (imageUrl && imageUrl.startsWith("/uploads/")) {
                          const backendUrl =
                            import.meta.env.VITE_BACKEND_URL ||
                            "http://localhost:4000";
                          imageUrl = `${backendUrl}${imageUrl}`;
                        }
                        return imageUrl;
                      })()}
                      alt={message.fileName || "Shared photo"}
                      className="w-full h-full object-cover hover:opacity-80 cursor-pointer transition-opacity"
                      onClick={() => {
                        let imageUrl = message.fileUrl;
                        if (imageUrl && imageUrl.startsWith("/uploads/")) {
                          const backendUrl =
                            import.meta.env.VITE_BACKEND_URL ||
                            "http://localhost:4000";
                          imageUrl = `${backendUrl}${imageUrl}`;
                        }
                        window.open(imageUrl, "_blank");
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                  expandedSection === "photos"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {sharedPhotos.slice(6).map((message, index) => (
                      <div
                        key={`${message.id}-${message.createdAt}-${index}-hidden`}
                        className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group"
                      >
                        <img
                          src={(() => {
                            let imageUrl =
                              message.fileUrl || "/images/default-image.png";
                            if (imageUrl && imageUrl.startsWith("/uploads/")) {
                              const backendUrl =
                                import.meta.env.VITE_BACKEND_URL ||
                                "http://localhost:4000";
                              imageUrl = `${backendUrl}${imageUrl}`;
                            }
                            return imageUrl;
                          })()}
                          alt={message.fileName || "Shared photo"}
                          className="w-full h-full object-cover hover:opacity-80 cursor-pointer transition-opacity"
                          onClick={() => {
                            let imageUrl = message.fileUrl;
                            if (imageUrl && imageUrl.startsWith("/uploads/")) {
                              const backendUrl =
                                import.meta.env.VITE_BACKEND_URL ||
                                "http://localhost:4000";
                              imageUrl = `${backendUrl}${imageUrl}`;
                            }
                            window.open(imageUrl, "_blank");
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
              <p className="text-sm">No photos shared yet</p>
            </div>
          )}
        </div>

        {/* Shared Documents */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Documents ({sharedDocuments.length})
            </h4>
            {sharedDocuments.length > 3 && (
              <button
                onClick={() => toggleSection("docs")}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none transition-colors duration-200"
              >
                {expandedSection === "docs" ? "Show Less" : "Show All"}
              </button>
            )}
          </div>

          {sharedDocuments.length > 0 ? (
            <div className="space-y-2">
              {sharedDocuments.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => window.open(message.fileUrl, "_blank")}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.fileName || "Unknown file"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {message.fileSize
                        ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB`
                        : "Unknown size"}{" "}
                      • {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                  expandedSection === "docs"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2 pt-2">
                    {sharedDocuments.slice(3).map((message) => (
                      <div
                        key={`${message.id}-hidden`}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => window.open(message.fileUrl, "_blank")}
                      >
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.fileName || "Unknown file"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {message.fileSize
                              ? `${(message.fileSize / 1024 / 1024).toFixed(
                                  1
                                )} MB`
                              : "Unknown size"}{" "}
                            • {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
              <p className="text-sm">No documents shared yet</p>
            </div>
          )}
        </div>

        {/* Other Files (Audio, etc.) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Other Files ({sharedOthers.length})
            </h4>
            {sharedOthers.length > 3 && (
              <button
                onClick={() => toggleSection("others")}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none transition-colors duration-200"
              >
                {expandedSection === "others" ? "Show Less" : "Show All"}
              </button>
            )}
          </div>

          {sharedOthers.length > 0 ? (
            <div className="space-y-2">
              {sharedOthers.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => window.open(message.fileUrl, "_blank")}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.fileName || "Unknown file"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {message.fileSize
                        ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB`
                        : "Unknown size"}{" "}
                      • {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                  expandedSection === "others"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2 pt-2">
                    {sharedOthers.slice(3).map((message) => (
                      <div
                        key={`${message.id}-hidden`}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => window.open(message.fileUrl, "_blank")}
                      >
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.fileName || "Unknown file"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {message.fileSize
                              ? `${(message.fileSize / 1024 / 1024).toFixed(
                                  1
                                )} MB`
                              : "Unknown size"}{" "}
                            • {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
              <p className="text-sm">No other files shared yet</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RightSidebar;
