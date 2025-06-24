import React, { useContext, useEffect, useState } from "react";
import { CiUndo, CiRedo } from "react-icons/ci";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import DashboardCard from '../Components/Dashboard/DashboardCard';
import { data } from "../services/mockData";
import { UserRoleContext } from "../UserRoleContext";
import {toast} from "react-toastify";
import { CloudUpload, X } from "lucide-react";

export interface Course {
  id?: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
  no_lessons: string;
  no_hours: string;
  uploader: {
    name: string;
    avatar_url: string;
  };
}

interface NewCourseFormData {
  id?: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
}


interface ImageUploadAreaProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?:string;
  courseData?:{
    title:string;
    description:string;
    price:string;
  }
}

const ImageUploadArea:React.FC<ImageUploadAreaProps>=({
    onImageSelect,
    currentImage,
    className="",
    courseData={title:"",description:"",price:""}
})=>{
    const [isDragging, setIsDragging]=useState(false);
    const [previewUrl, setPreviewUrl]=useState(currentImage || "");
    const [isLoading, setIsLoading]=useState(false);

    useEffect(()=>{
        setPreviewUrl(currentImage || "");
    },[currentImage]);
    const handleDragOver= (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragerEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }
    const handleDrageLeaver=(e:React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if(!e.currentTarget.contains(e.relatedTarget as Node)){
            setIsDragging(false);
        }
    }

    const handleDrop=(e:React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if(files && files.length > 0){
            handleFileSelect(files[0]);
        }
    }
    const handleFileSelect=(file:File)=>{
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select a valid image file (JPG, PNG, GIF)');
            return;
          }
    }
    const handleClickToUpload=()=>{
        const fileInput = document.createElement('file-input') as HTMLInputElement;
        fileInput?.click();
    };

    return(
     <div className={`w-full ${className}`}>
        <label className="block mb-2 font-medium text-[#004e64] ">Course Cover Image *</label>
     <div className={`
        relative.border-2 border-dashed rounded-lg transition-all duration-300  ease-in-out
        ${isDragging ? "border-[#004e64] bg-gradient-to-br from-[#004e64]/10 via-[#004e64]/15 to-[#004e64]/10 scale-102 shadow-lg"
            : 'border-[#004e64]/30 hover:border-[#004e64]/50'
        }  
        ${previewUrl ? "p-3" : "p-8"}
        bg-gradient-to-br from-white via-[#f8feff] to-white
          hover:shadow-md hover:shadow-[#004e64]/10
          cursor-pointer group
          min-h-[120px]

        `}>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004e64]">
                        <p className="mt-2 text-sm text-gray-500">Processing image</p>
                    </div>
                </div>
            ):previewUrl ? (
                <div className="space-y-6">
                    <div className="w-full max-w-sm">
                        <div className="bg-white rounded-lg shadow-xl overflow-hidden border-[#004e64]/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                        <div className="relative group">
                            <img src={previewUrl} alt="Course Preview" className="w-full h-48 object-cover" onError={e=>{
                                console.log("Error loading image", e);
                                e.currentTarget.src = `https://via.placeholder.com/400x200/004e64/white?text=Course+Image`;
                            }} />

                            <button className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white p-2 rouded-full hover:bg-red-600 transition-all duration-300 shadow-lg transform hover:scale-110 z-999">
                            <X className="w-4 h-4"/>
                            </button>

                            <div className="absolute inset-0 bg-gradient-to-t from-black" />
                            <div className="via-transparent to-transparent group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <CloudUpload className="text-white font-medium text-sm drop-shadow-lg">
                                        <span className="text-white font-medium text-sm drop-shadow-ls">Click or drag to change image</span>
                                    </CloudUpload>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            ):(
                <div className="text-center">
                    
                </div>
            )}
        </div>
     </div>
    )


}



const CourseManagement = () => {
  const userRole = useContext(UserRoleContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setCourses(data);
    };
    fetchData();
  }, []);

  const handleCourseCreation = (courseId: number) => {
    console.log("Starting course:", courseId);
  };

  return (
    <div>
      <div className="h-screenflex sticky top-4 flex-col">
        {userRole === "teacher" && (
          <div>
            <div className="z-10 sticky top-40 flex place-items-start justify-between p-3 rounded-lg bg-white shadow-lg">
              <span className="md:text-2xl text-lg font-normal text-gray-800">
                Courses
              </span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                  <CiUndo />
                </button>
                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                  <CiRedo />
                </button>
                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                  <HiOutlineAdjustmentsHorizontal />
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#1a3c34] cursor-pointer to-[#2e856e] text-white rounded-full hover:from-[#2e856e] hover:to-[#1a3c34]"
                >
                  <span>Add</span>
                  <span>+</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="scroll-hide">
        <DashboardCard
          courses={courses}
          onCourseAction={handleCourseCreation}
        />
      </div>

      {showModal && <div className=""></div>}
    </div>
  );
};

export default CourseManagement;
