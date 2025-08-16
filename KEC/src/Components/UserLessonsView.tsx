import React from 'react'
import { Lessons } from '../services/mockData'
import ModuleManagement from '../Components/moduleManagement'
import StudentModules from '../Components/StudentModules'


const UserLessonsView = () => {
  return (
   <div className="">
     <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className='my-4'>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
                Course Lessons
              </h1>
              <p className="text-md text-gray-600 mt-2 max-w-2xl">
                Learn this course with ease, manage your progress, and access all learning materials.
              </p>
             
            </div>
            
    
          </div>
        </div>
       <StudentModules WholeModules={Lessons} />
      
    </div>
   
  )
}

export default UserLessonsView
