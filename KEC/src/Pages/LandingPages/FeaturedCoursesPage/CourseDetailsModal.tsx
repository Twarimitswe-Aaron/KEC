import React from "react";
import { X, Star, Video, CheckCircle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTextButton } from "../../../Components/Common/AnimatedTextButton";

interface Course {
    image_url: string;
    title: string;
    price: string;
    no_lessons: string;
    no_hours: string;
    uploaded: string;
    rate: number;
}

interface CourseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ isOpen, onClose, course }) => {
    if (!isOpen || !course) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-md"
                />

                {/* Modal Card Wrapper (Premium Border) */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="relative w-full max-w-4xl max-h-[90vh] shadow-2xl"
                >
                    {/* The "Border" Container */}
                    <div className="w-full h-full bg-[#e5e5e5] rounded-[32px] p-[5px] overflow-hidden">

                        {/* Inner Content Card */}
                        <div className="bg-[#f0f0f0] w-full h-full rounded-[28px] flex flex-col md:flex-row overflow-hidden relative">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X size={20} className="text-[#151619]" />
                            </button>

                            {/* Left Side: Image & Quick Stats */}
                            <div className="w-full md:w-1/2 h-[300px] md:h-full relative">
                                <img
                                    src={course.image_url}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-[#151619] text-white text-xs font-bold px-3 py-1 rounded-full">
                                            Best Seller
                                        </span>
                                        <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Star size={12} fill="white" /> {course.rate}.0
                                        </span>
                                    </div>
                                    <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight">{course.title}</h2>
                                </div>
                            </div>

                            {/* Right Side: Details & Content */}
                            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-[#fcfcfc]">
                                {/* Header Info */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{course.uploaded}</span>
                                        </div>
                                    </div>

                                    <p className="font-sans font-semibold text-[1.2rem] leading-[1.2em] tracking-[-0.05em] text-[#151619]">
                                        Master the fundamentals of {course.title} with our comprehensive curriculum designed for both beginners and advanced learners. Join thousands of students achieving their goals.
                                    </p>
                                </div>

                                {/* Bento Grid Stats (Simplified) */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-[#f0f0f0] p-4 rounded-2xl flex flex-col gap-1">
                                        <Video size={20} className="text-[#151619] mb-1" />
                                        <span className="text-xs text-gray-500 font-semibold uppercase">Lessons</span>
                                        <span className="text-lg font-bold text-[#151619]">{course.no_lessons}</span>
                                    </div>
                                    <div className="bg-[#f0f0f0] p-4 rounded-2xl flex flex-col gap-1">
                                        <CheckCircle size={20} className="text-[#151619] mb-1" />
                                        <span className="text-xs text-gray-500 font-semibold uppercase">Certificate</span>
                                        <span className="text-lg font-bold text-[#151619]">Included</span>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Total Price</span>
                                        <span className="text-2xl font-bold text-[#151619]">{course.price}</span>
                                    </div>

                                    {/* Animated Button */}
                                    <div className="flex-1">
                                        <AnimatedTextButton
                                            text="Enroll Now"
                                            variant="secondary"
                                            className="w-full !justify-center hover:bg-[#2a2b2e] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CourseDetailsModal;
