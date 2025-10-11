import React from 'react'
import { Lessons } from '../services/mockData'
import ModuleManagement from '../Components/ModuleManagement'
import { useParams } from 'react-router-dom'


const LessonsView = () => {
  const params=useParams()
  const {id}=params;
  console.log("Course Id:",id);
  return (
    <div>
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
              <div className="flex mt-4 items-center gap-4 justify-between text-gray-500">  
                <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  {Lessons.filter(m => m.isUnlocked).length} Unlocked
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  {Lessons.filter(m => !m.isUnlocked).length} Locked
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  {Lessons.reduce((acc, m) => acc + m.resources.length, 0)} Resources
                </span>
                </div>
                <div className="">
                    <p className="text-sm text-gray-500 ">
                        {Lessons[0].uploader.name}
                    </p>
                </div>
              </div>
            </div>
            
    
          </div>
        </div>
       <ModuleManagement />
    </div>
  )
}

export default LessonsView
