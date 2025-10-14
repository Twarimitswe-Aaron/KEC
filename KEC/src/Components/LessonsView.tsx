import React, { useState, useEffect } from 'react';
import ModuleManagement from '../Components/ModuleManagement';
import { useParams } from 'react-router-dom';
import { useGetCourseDataQuery } from '../state/api/courseApi';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const LessonsView = () => {
  const { id } = useParams();

  const { data: courseData, isLoading, error } = useGetCourseDataQuery(Number(id));

  const [showAddModule, setShowAddModule] = useState(false);
  const [showCourseOptions, setShowCourseOptions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMaxStudents, setEditMaxStudents] = useState(0);
  const [editIsOpen, setEditIsOpen] = useState(false);

  useEffect(() => {
    if (courseData) {
      setEditTitle(courseData.title || '');
      setEditDescription(courseData.description || '');
      setEditImage(courseData.image_url || '');
      setEditImagePreview(courseData.image_url || '');
      setEditPrice(courseData.price || '');
      setEditMaxStudents(courseData.maximum || 0);
      setEditIsOpen(courseData.open || false);
    }
  }, [courseData]);

  if (isLoading) return <p>Loading course data...</p>;
  if (error) return <p>Error loading course data.</p>;

  const lessons = courseData?.lesson || [];
  const unlockedCount = lessons.filter(l => (l as any).status).length;
  const lockedCount = lessons.length - unlockedCount;
  const totalResources = lessons.reduce((acc, l) => acc + (l.resources?.length || 0), 0);

  // Handlers
  const handleAddModule = () => {
    if (!newModuleTitle.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }else if(!newModuleDescription.trim()){
      toast.error('Please enter a lesson description');
      return;
    }

    console.log('Adding module:', newModuleTitle, newModuleDescription);
    // TODO: Call backend API here to create module
    // Example: createModuleMutation({ courseId: id, title: newModuleTitle, description: newModuleDescription })
    setShowAddModule(false);
    setNewModuleTitle('');
    setNewModuleDescription('');
  };

  const handleDeleteCourse = () => {
    setShowCourseOptions(false);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = () => {
    console.log('Course deleted:', courseData?.id);
    // TODO: Call backend API to delete course
    // Example: deleteCourseMutation(id)
    setShowDeleteConfirm(false);
  };

  const handleEditCourse = () => {
    setShowCourseOptions(false);
    setShowEditForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCourse = () => {
    const updateData = {
      id: Number(id),
      title: editTitle,
      description: editDescription,
      image_url: editImage,
      coursePrice: editPrice,
      maximum: editMaxStudents,
      open: editIsOpen
    };
    console.log('Updating course:', updateData);
    // TODO: Call backend API to update course
    // Example: updateCourseMutation(updateData)
    setShowEditForm(false);
  };

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
            {courseData?.title} Lessons
          </h1>
          <p className="text-md text-gray-600 mt-2 max-w-2xl">
            Organize your course content, manage access permissions, and upload learning materials
          </p>
          <div className="flex mt-4 items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              {unlockedCount} Unlocked
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              {lockedCount} Locked
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              {totalResources} Resources
            </span>
          </div>
        </div>

        {/* Action Buttons - Right Side */}
        <div className="flex gap-2 items-start">
          {/* Add Module Button */}
          <button
            className=" text-white px-4 py-2 rounded bg-[#034153] cursor-pointer transition-colors whitespace-nowrap"
            onClick={() => setShowAddModule(!showAddModule)}
          >
            Add Module
          </button>

          {/* Three-dots Course Options */}
          <div className="relative">
            <button
              className="text-gray-700 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded transition-colors text-xl font-bold"
              onClick={() => setShowCourseOptions(!showCourseOptions)}
            >
              ⋮
            </button>
            {showCourseOptions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowCourseOptions(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#034153] shadow-lg rounded-md py-1 z-20 ">
                  <button
                    className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 transition-colors"
                    onClick={handleEditCourse}
                  >
                    Edit Course
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 cursor-pointer  hover:bg-red-50 text-red-600 transition-colors"
                    onClick={handleDeleteCourse}
                  >
                    Delete Course
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showAddModule && (
        <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
       
            <div className=" px-6 pt-3 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#034153]">Create Your Lesson</h2>

              </div>
              <button
                onClick={() => setShowAddModule(false)}
                className="text-gray-700  cursor-pointer hover:bg-gray-30 p-2 mt-2 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g: Thermodynamics"
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  className="w-full border-1 border-gray-200 px-3 py-3 rounded-lg  focus:border-[#034153] transition-all outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Module Description
                </label>
                <textarea
                  placeholder="Provide a brief overview of what students will learn in this lesson..."
                  value={newModuleDescription}
                  onChange={e => setNewModuleDescription(e.target.value)}
                  rows={4}
                  className="w-full border-1 border-gray-200 focus:border-[#034153] px-3 py-2 rounded-lg   transition-all outline-none resize-none"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddModule}
                  className="flex-1 bg-[#034153] cursor-pointer text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Create Lesson
                </button>
                <button
                  onClick={() => {
                    setShowAddModule(false);
                    setNewModuleTitle('');
                    setNewModuleDescription('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all border border-gray-300 hover:shadow-md cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl scroll-hide max-h-[90vh] overflow-y-auto border border-[#004e64]/10">
            {/* Header with gradient */}
            <div className="sticky top-0  px-6 py-5 bg-white rounded-t-2xl flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-[#034153]">Edit Course</h2>

              </div>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-700 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Course Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#004e64] mb-3">
                  Course Image <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center">
                  {/* Image Preview */}
                  {editImagePreview && (
                    <div className="mb-4 relative group">
                      <img 
                        src={editImagePreview} 
                        alt="Course preview" 
                        className="w-full max-w-md h-48 object-cover rounded-xl border-2 border-[#004e64]/20 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Click below to change image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <label className="w-full max-w-md cursor-pointer">
                    <div className="border-2 border-dashed border-[#004e64]/30 rounded-xl p-6 hover:border-[#004e64] hover:bg-[#004e64]/5 transition-all text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-[#004e64]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-[#004e64] font-medium">
                          {editImageFile ? editImageFile.name : 'Click to upload new image'}
                        </span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden "
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Title */}
                <div>
                  <label className="block text-sm font-semibold text-[#004e64] mb-2">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Enter course title..."
                    maxLength={50}
                    className="w-full border-1 border-gray-200 focus:border-[#034153] px-4 py-3 rounded-lg  focus:border-[#004e64] transition-all outline-none hover:shadow-md"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">
                    {editTitle.length}/50 characters
                  </span>
                </div>

                {/* Course Price */}
                <div>
                  <label className="block text-sm font-semibold text-[#004e64] mb-2">
                    Course Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    placeholder="e.g., 100,000 RWF"
                    className="w-full border-1 border-gray-200 focus:border-[#034153] px-4 py-3 rounded-lg  transition-all outline-none hover:shadow-md"
                  />
                </div>
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-semibold text-[#004e64] mb-2">
                  Course Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={4}
                  maxLength={250}
                  placeholder="Describe what students will learn in this course..."
                  className="w-full border-1 border-gray-200 focus:border-[#034153] px-4 py-3 rounded-lg  transition-all outline-none resize-none hover:shadow-md"
                />
                <span className="text-xs text-gray-400 mt-1 block">
                  {editDescription.length}/250 characters
                </span>
              </div>

              {/* Maximum Students */}
              <div>
                <label className="block text-sm font-semibold text-[#004e64] mb-2">
                  Maximum Students
                </label>
                <input
                  type="number"
                  value={editMaxStudents}
                  onChange={e => setEditMaxStudents(Number(e.target.value))}
                  min="0"
                  placeholder="Leave 0 for unlimited"
                  className="w-full border-1 border-gray-200 focus:border-[#034153] px-4 py-3 rounded-lg  transition-all outline-none hover:shadow-md"
                />
              </div>

              {/* Open/Close Course Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#004e64]/5 to-[#025a73]/5 rounded-lg border border-[#004e64]/20">
                <input
                  type="checkbox"
                  id="openCourse"
                  checked={editIsOpen}
                  onChange={() => setEditIsOpen(!editIsOpen)}
                  className="w-5 h-5 text-[#004e64] rounded focus:ring-2 focus:ring-[#004e64]/50 cursor-pointer"
                />
                <label htmlFor="openCourse" className="text-sm font-semibold text-[#004e64] cursor-pointer">
                  Open Course for Enrollment
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleUpdateCourse}
                  className="flex-1 bg-gradient-to-r from-[#004e64] via-[#025d75] to-[#022F40] text-white px-6 py-3 cursor-pointer rounded-lg font-semibold hover:from-[#022F40] hover:to-[#011d2b] transition-all shadow-lg hover:shadow-xl transform hover:scale-102"
                >
                  Update Course
                </button>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 px-6 py-3 rounded-lg cursor-pointer font-medium hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-300 hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-[#034153]">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be undone and will remove all associated lessons, and assignments.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteCourse}
                className="flex-1 bg-red-500 text-white px-4 py-3 cursor-pointer rounded-md hover:bg-red-600 transition-colors font-medium"
              >
                Delete Course
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 cursor-pointer rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Management */}
      <ModuleManagement lessons={lessons} />
    </div>
  );
};

export default LessonsView;