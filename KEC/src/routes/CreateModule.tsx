
import React, { useState } from 'react'
import { FaPlus, FaLock, FaUnlock,FaFile,FaTrash,FaCross, FaX } from 'react-icons/fa6'
import ModuleManagement from '../Components/ModuleManagement'
import { Lessons } from '../services/mockData'

const CreateModule = () => {
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    isUnlocked: false
  })
  const [showAddModule, setShowAddModule] = useState(false)
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
      resources: [],
      uploader: {
        name: "Current User",
        avatar_url: "/images/avatars/default.png",
      }
    }

    setModules(prev => [...prev, module])
    setNewModule({ title: '', description: '', isUnlocked: false })
    setShowAddModule(false)
  }
  const [modules, setModules] = useState(Lessons)

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
                Course Lessons
              </h1>
              <p className="text-md text-gray-600 mt-2 max-w-2xl">
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
              className="bg-gradient-to-r from-[#004e64] to-[#025a73]  text-white px-3 py-3 rounded-xl font-bold   transform hover:scale-101 cursor-pointer transition-all duration-300 flex items-center sm:min-w-[10rem] max-w-[10rem] gap-3 text-sm"
            >
              <FaPlus size={20}/>
             <span className=''>New Module</span>
            </button>
          </div>
        </div>

      <ModuleManagement />
          {/* Add Module Modal */}
          {showAddModule && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full transform scale-100 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between ">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#004e64] to-[#025a73] bg-clip-text text-transparent">
                  Create New Module
                </h3>
                <button
                  onClick={() => setShowAddModule(false)}
                  className="text-gray-400 cursor-pointer hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <FaX/>
                </button>
              </div>
              
              <form onSubmit={handleAddModule} className="">
                <div>
                  <label className="block text-gray-700 font-bold my-4 text-lg">Module Title</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                    className="w-full px-3 py-2 border-1 border-[#034153] rounded-md focus:outline-none focus:ring-1 focus:ring-[#004e64]/20 focus:border-[#004e64] transition-all duration-200 text-lg"
                    placeholder="Enter module title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block  text-gray-700 font-bold my-3 text-lg">Description</label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                    className="w-full rounded-md  px-4 py-4 border border-[#034153] focus:outline-none focus:ring-1 focus:ring-[#004e64]/20 focus:border-[#004e64] transition-all duration-200 text-lg"
                    placeholder="Describe what students will learn in this lesson"
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
                  <input
                    type="checkbox"
                    id="unlocked"
                    checked={newModule.isUnlocked}
                    onChange={(e) => setNewModule({...newModule, isUnlocked: e.target.checked})}
                    className="w-5 h-5 text-[#004e64] border-2 border-gray-300 rounded xlcus:ring-[#004e64] focus:ring-2"
                  />
                  <label htmlFor="unlocked" className="text-gray-700 font-bold text-md flex-1">
                    Make this module available to students immediately
                    <span className="block text-sm font-normal text-gray-500 mt-1">
                      Students will be able to access this module right away
                    </span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-4 mt-3 ">
                <button
                    type="button"
                    onClick={() => setShowAddModule(false)}
                    className="cursor-pointer rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-xll font-bold text-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 cursor-pointer  bg-gradient-to-r from-[#004e64] to-[#025a73]  text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-101 transition-all duration-200"
                  >
                    Create Module
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