import React, { useState } from 'react'
import { FaPlus, FaLock, FaUnlock,FaFile,FaTrash, FaX } from 'react-icons/fa6'

interface module {
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

function ModuleManagement({ WholeModules }: { WholeModules: module[] }) {
    const [showAddModule, setShowAddModule] = useState(false)
    const [showAddResource, setShowAddResource] = useState<number | null>(null)
    const [draggedFile, setDraggedFile] = useState(null)
  
    const [modules,setModules]=useState<module[]>(WholeModules)
      // Sort modules by creation date (latest first)
  const sortedModules = [...modules].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
 
  const toggleModuleUnlock = (moduleId:number) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isUnlocked: !module.isUnlocked }
        : module
    ))
  }
  
  const deleteModule = (moduleId: number) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setModules(prev => prev.filter(module => module.id !== moduleId))
    }
  }
  const handleFileUpload = (moduleId: number, file: File, type: string) => {
    const resource = type === 'pdf' 
      ? {
          id: Date.now(),
          name: file.name,
          type: type,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      : {
          id: Date.now(),
          name: file.name,
          type: type,
          duration: '15:30', // Simulated duration
          uploadedAt: new Date().toISOString().split('T')[0]
        }

    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, resources: [...module.resources, resource] }
        : module
    ))
    setShowAddResource(null)
  }

  const simulateFileUpload = (moduleId: number, type: string) => {
    const fileName = type === 'pdf' ? 'New_Document.pdf' : 'New_Video.mp4'
    const fileSize = type === 'pdf' ? 2048000 : 10485760 // 2MB for PDF, 10MB for video
    
    // Create a proper File object
    const fakeFile = new File([''], fileName, { 
      type: type === 'pdf' ? 'application/pdf' : 'video/mp4',
      lastModified: Date.now()
    })
    
    // Override the size property since File constructor doesn't set it
    Object.defineProperty(fakeFile, 'size', { value: fileSize })
    
    handleFileUpload(moduleId, fakeFile, type)
  }

  const removeResource = (moduleId: number, resourceId: number) => {
    if (window.confirm('Remove this resource?')) {
      setModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { ...module, resources: module.resources.filter(r => r.id !== resourceId) }
          : module
      ))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, moduleId: number) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      const type = file.type.includes('pdf') ? 'pdf' : 'video'
      handleFileUpload(moduleId, file, type)
    })
  }
  return (
    <div className="">
         <div className="space-y-8">
          {sortedModules.map((module, index) => (
            <div
              key={module.id}
              className={`group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border ${
                module.isUnlocked 
                  ? 'border-green-200 hover:border-green-300' 
                  : 'border-amber-200 hover:border-amber-300'
              }`}
            >
              {/* Module Header */}
              <div className="p-4">
                <div className="flex items-center  justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                        module.isUnlocked 
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                          : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                      }`}>
                        {module.isUnlocked ? (
                          <FaUnlock/>
                        ) : (
                          <FaLock />
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 ">{module.order}. {module.title}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">{module.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Module Actions */}
                  <div className="flex flex-col sm:flex-row items-end gap-3">
                    <button
                      onClick={() => toggleModuleUnlock(module.id)}
                      className={` py-2 cursor-pointer rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-101 transition-all duration-200 ${
                        module.isUnlocked
                          ? 'bg-gradient-to-r px-3 from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white'
                          : 'bg-gradient-to-r px-2 from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white'
                      }`}
                    >
                      {module.isUnlocked ? (
                        <span className="flex items-center gap-2">
                          <FaLock size={15}/>
                          Lock
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <FaUnlock size={15} />
                          Unlock
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowAddResource(showAddResource === module.id ? null : module.id)}
                      className="px-3 cursor-pointer py-2 bg-gradient-to-r from-[#004e64] to-[#025a73]  text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-101 transition-all duration-200"
                    >
                      <span className="flex items-center gap-2">
                        <FaPlus/>
                         Resource
                      </span>
                    </button>
                    
                    <button
                      onClick={() => deleteModule(module.id)}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Resource Section */}
              {showAddResource === module.id && (
                <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                  <h3 className="text-md font-bold text-gray-900 mb-4">Add New Resource</h3>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, module.id)}
                  >
                    <button
                      onClick={() => simulateFileUpload(module.id, 'pdf')}
                      className="group p-8 border-3 border-dashed border-red-300 hover:border-red-500 rounded-xll hover:bg-red-50 transition-all duration-300 text-center transform hover:scale-105"
                    >
                      <svg className="w-12 h-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-bold text-red-700 mb-2">Upload PDF Document</p>
                      <p className="text-sm text-red-600">Click or drag PDF files here</p>
                    </button>
                    
                    <button
                      onClick={() => simulateFileUpload(module.id, 'video')}
                      className="group p-8 border-3 border-dashed border-purple-300 hover:border-purple-500 rounded-xll hover:bg-purple-50 transition-all duration-300 text-center transform hover:scale-105"
                    >
                      <svg className="w-12 h-12 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <p className="text-lg font-bold text-purple-700 mb-2">Upload Video</p>
                      <p className="text-sm text-purple-600">Click or drag video files here</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Resources Section */}
              {module.resources.length > 0 && (
                <div className="border-t w-full border-gray-200 bg-white/50  py-3 px-6">
                  <h3 className="text-md font-bold mb-3 text-gray-900  flex items-center ">
      
                    Resources ({module.resources.length})
                  </h3>
                  
                  <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3  justify-between  w-full">
                    {module.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="group bg-white flex gap-2   rounded-xl px-2 py-2 items-center shadow-md hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all w-full md:w-[16rem] duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-center justify-between ">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                            resource.type === 'pdf' 
                              ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' 
                              : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                          }`}>
                            {resource.type === 'pdf' ? (
                              <FaFile/>
                            ) : (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            )}
                          </div>
                          
                          
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{resource.name}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {resource.type === 'pdf' ? resource.size : resource.duration}
                            </span>
                            <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xll flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-600 mb-6">Start building your course by adding your first module</p>
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-gradient-to-r from-[#004e64] to-[#025a73] text-white px-8 py-4 rounded-xll font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Create First Module
            </button>
          </div>
        )}

    
    </div>
  )
}

export default ModuleManagement
