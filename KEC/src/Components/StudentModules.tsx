import React, { useState } from 'react'
import { FaUnlock, FaLock, FaFile } from 'react-icons/fa6'

interface Module {
  id: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  order: number;
  createdAt: string;
  resources: {
    id?: number;
    name?: string;
    type?: string;
    size?: string;
    uploadedAt: string;
    duration?: string;
  }[];
}

function StudentModules({ WholeModules }: { WholeModules: Module[] }) {
  // Sort & filter only unlocked modules
  const sortedModules = [...WholeModules]
    .filter((m) => m.isUnlocked) // hide locked ones
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-8">
      {sortedModules.map((module) => (
        <div
          key={module.id}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-green-200"
        >
          {/* Module Header */}
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-green-400 to-green-600 text-white">
                <FaUnlock />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {module.order}. {module.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {module.description}
                </p>
              </div>
            </div>
          </div>

          {/* Resources Section */}
          {module.resources.length > 0 && (
            <div className="border-t w-full border-gray-200 bg-white/50 py-3 px-6">
              <h3 className="text-md font-bold mb-3 text-gray-900">
                Resources ({module.resources.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 w-full">
                {module.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white flex gap-2 rounded-xl px-2 py-2 items-center shadow-md border border-gray-200 transition-all"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        resource.type === 'pdf'
                          ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                          : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                      }`}
                    >
                      {resource.type === 'pdf' ? (
                        <FaFile />
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                        {resource.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {resource.type === 'pdf'
                            ? resource.size
                            : resource.duration}
                        </span>
                        <span>
                          {new Date(resource.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Empty state if no modules */}
      {sortedModules.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No available Lesson
          </h3>
          <p className="text-gray-600 mb-6">
            Please check back later for course content.
          </p>
        </div>
      )}
    </div>
  )
}

export default StudentModules
