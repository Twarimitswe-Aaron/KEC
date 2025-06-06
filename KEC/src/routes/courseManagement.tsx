import React, { useContext, useEffect, useState } from 'react'
import { CiUndo, CiRedo } from "react-icons/ci";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import {BsCameraVideoFill} from "react-icons/bs"
import {GoStopwatch} from "react-icons/go"
import DashboardCard from '../Components/Dashboard/DashboardCard';
import {data} from "../services/mockData"
import { UserRoleContext } from '../UserRoleContext';

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

const CourseManagement = () => {
    const userRole = useContext(UserRoleContext);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setCourses(data);
        };
        fetchData();
    }, []);

    const handleCourseCreation = (courseId: number) => {
        console.log('Starting course:', courseId);
    };
    
    return (
        <div>
            <div className="h-screenflex sticky top-4 flex-col">
                {userRole === "teacher" && (
                    <div>
                        <div className="z-10 sticky top-20 flex place-items-start justify-between p-3 rounded-lg bg-white shadow-lg">
                            <span className="md:text-2xl text-lg font-normal text-gray-800">Users</span>
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                                    <CiUndo/>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                                    <CiRedo/>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                                    <HiOutlineAdjustmentsHorizontal/>
                                </button>
                                <button className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#1a3c34] cursor-pointer to-[#2e856e] text-white rounded-full hover:from-[#2e856e] hover:to-[#1a3c34]">
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
        </div>
    )
}

export default CourseManagement;
