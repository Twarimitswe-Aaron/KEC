import React, { useState } from 'react'

const CreateModule = () => {
  const [modules, setModules] = useState([
    {
      id: 1,
      title: "Introduction to Course",
      description: "Welcome and course overview",
      isUnlocked: true,
      order: 1,
      createdAt: "2025-01-10",
      resources: [
        { id: 1, name: "Course_Introduction.pdf", type: "pdf", size: "2.1 MB", uploadedAt: "2025-01-10" },
        { id: 2, name: "Welcome_Video.mp4", type: "video", duration: "12:45", uploadedAt: "2025-01-10" }
      ]
    },
    {
      id: 2,
      title: "Getting Started",
      description: "Basic setup and fundamentals",
      isUnlocked: true,
      order: 2,
      createdAt: "2025-01-12",
      resources: [
        { id: 3, name: "Setup_Guide.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "2025-01-12" },
        { id: 4, name: "Setup_Tutorial.mp4", type: "video", duration: "18:30", uploadedAt: "2025-01-12" }
      ]
    },
    {
      id: 3,
      title: "Advanced Topics",
      description: "Deep dive into complex concepts",
      isUnlocked: false,
      order: 3,
      createdAt: "2025-01-15",
      resources: [
        { id: 5, name: "Advanced_Concepts.pdf", type: "pdf", size: "4.2 MB", uploadedAt: "2025-01-15" }
      ]
    }
  ])

  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddResource, setShowAddResource] = useState<number | null>(null)
  const [draggedFile, setDraggedFile] = useState(null)
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    isUnlocked: false
  })

  // Sort modules by creation date (latest first)
  const sortedModules = [...modules].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleAddModule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newModule.title.trim()) return

    const module = {
      id: Date.now(),
      title: newModule.title,
      description: newModule.description,
      isUnlocked: newModule.isUnlocked,
      order: modules.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      resources: []
    }

    setModules(prev => [...prev, module])
    setNewModule({ title: '', description: '', isUnlocked: false })
    setShowAddModule(false)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
                Course Modules
              </h1>
              <p className="text-lg text-gray-600 mt-2 max-w-2xl">
                Organize your course content, manage access permissions, and upload learning materials
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  {modules.filter(m => m.isUnlocked).length} Unlocked
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  {modules.filter(m => !m.isUnlocked).length} Locked
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  {modules.reduce((acc, m) => acc + m.resources.length, 0)} Resources
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-gradient-to-r from-[#004e64] to-[#025a73] hover:from-[#003a4c] hover:to-[#014d61] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Module
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-8">
          {sortedModules.map((module, index) => (
            <div
              key={module.id}
              className={`group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border ${
                module.isUnlocked 
                  ? 'border-green-200 hover:border-green-300' 
                  : 'border-amber-200 hover:border-amber-300'
              }`}
            >
              {/* Module Header */}
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                        module.isUnlocked 
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                          : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                      }`}>
                        {module.isUnlocked ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3a2 2 0 002 2h4a2 2 0 002-2v-3" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l3 3 3-3" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h2>
                        <p className="text-gray-600 text-lg leading-relaxed">{module.description}</p>
                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            Module #{module.order}
                          </span>
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v2m6-2v2m-6-2h6m-6 4h6m-6 0v4a2 2 0 002 2h2a2 2 0 002-2v-4" />
                            </svg>
                            {new Date(module.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {module.resources.length} Resources
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Module Actions */}
                  <div className="flex flex-col sm:flex-row items-end gap-3">
                    <button
                      onClick={() => toggleModuleUnlock(module.id)}
                      className={`px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                        module.isUnlocked
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white'
                          : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white'
                      }`}
                    >
                      {module.isUnlocked ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Lock Module
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Unlock Module
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowAddResource(showAddResource === module.id ? null : module.id)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Resource
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
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Resource</h3>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, module.id)}
                  >
                    <button
                      onClick={() => simulateFileUpload(module.id, 'pdf')}
                      className="group p-8 border-3 border-dashed border-red-300 hover:border-red-500 rounded-2xl hover:bg-red-50 transition-all duration-300 text-center transform hover:scale-105"
                    >
                      <svg className="w-12 h-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-bold text-red-700 mb-2">Upload PDF Document</p>
                      <p className="text-sm text-red-600">Click or drag PDF files here</p>
                    </button>
                    
                    <button
                      onClick={() => simulateFileUpload(module.id, 'video')}
                      className="group p-8 border-3 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl hover:bg-purple-50 transition-all duration-300 text-center transform hover:scale-105"
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
                <div className="border-t border-gray-200 bg-white/50 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Course Resources ({module.resources.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {module.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                            resource.type === 'pdf' 
                              ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' 
                              : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                          }`}>
                            {resource.type === 'pdf' ? (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeResource(module.id, resource.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
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
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-600 mb-6">Start building your course by adding your first module</p>
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-gradient-to-r from-[#004e64] to-[#025a73] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Create First Module
            </button>
          </div>
        )}

        {/* Add Module Modal */}
        {showAddModule && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full transform scale-100 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-[#004e64] to-[#025a73] bg-clip-text text-transparent">
                  Create New Module
                </h3>
                <button
                  onClick={() => setShowAddModule(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddModule} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 text-lg">Module Title</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#004e64]/20 focus:border-[#004e64] transition-all duration-200 text-lg"
                    placeholder="Enter an engaging module title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-bold mb-3 text-lg">Description</label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#004e64]/20 focus:border-[#004e64] transition-all duration-200 text-lg"
                    placeholder="Describe what students will learn in this module"
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <input
                    type="checkbox"
                    id="unlocked"
                    checked={newModule.isUnlocked}
                    onChange={(e) => setNewModule({...newModule, isUnlocked: e.target.checked})}
                    className="w-5 h-5 text-[#004e64] border-2 border-gray-300 rounded focus:ring-[#004e64] focus:ring-2"
                  />
                  <label htmlFor="unlocked" className="text-gray-700 font-bold text-lg flex-1">
                    Make this module available to students immediately
                    <span className="block text-sm font-normal text-gray-500 mt-1">
                      Students will be able to access this module right away
                    </span>
                  </label>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#004e64] to-[#025a73] hover:from-[#003a4c] hover:to-[#014d61] text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Create Module
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModule(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateModule