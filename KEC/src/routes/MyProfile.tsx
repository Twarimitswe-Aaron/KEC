import React, { useContext, useState } from "react";
import {
  FaHome,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaHeart,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaCamera,
  FaUserPlus,
  FaEllipsisH,
} from "react-icons/fa";
import { MdClose, MdEdit } from "react-icons/md";
import { UserRoleContext } from "../UserRoleContext";

const ProfileComponent = () => {
  const UserRole = useContext(UserRoleContext);
  const [activeTab, setActiveTab] = useState("Posts");
  const [bio, setBio] = useState("Admin at Technology Company");
  const [currentCity, setCurrentCity] = useState("Lives in Gasabo, Rwanda");
  const [hometown, setHometown] = useState("From Kigali, Gasabo, Rwanda");
  const [workplace, setWorkplace] = useState(
    "Work in the new Technology Company"
  );
  const [education, setEducation] = useState(
    "Studied in Kigali Secondary Education"
  );
  const [showCurrentCity, setShowCurrentCity] = useState(true);
  const [showHometown, setShowHometown] = useState(true);
  const [showWorkplace, setShowWorkplace] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkplace, setEditingWorkplace] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [newWorkplace, setNewWorkplace] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const [postContent, setPostContent] = useState("");
  const [joinDate] = useState("Join June 27, 2007");
  const [email] = useState("aarontwarimitswe@gmail.com");
  const [phone] = useState("+250 784 156 865");

  const handleSave = () => {
    if (newWorkplace.trim() !== "") {
      setWorkplace(newWorkplace);
      setNewWorkplace("");
    }
    if (newEducation.trim() !== "") {
      setEducation(newEducation);
      setNewEducation("");
    }
    setEditingWorkplace(false);
    setEditingEducation(false);
    setShowModal(false);
  };

  const handlePostSubmit = () => {
    console.log("Post submitted:", postContent);
    setPostContent("");
  };

  const startEditingWorkplace = () => {
    setNewWorkplace(workplace);
    setEditingWorkplace(true);
    setEditingEducation(false);
  };

  const startEditingEducation = () => {
    setNewEducation(education);
    setEditingEducation(true);
    setEditingWorkplace(false);
  };

  return (
    <div className="bg-gray-100 rounded-md min-h-screen">
      {/* Cover Photo */}
      <div className="flex flex-col items-center gap-3 justify-center h-90">
        <div className="inset-0 bg-white bg-opacity-20"></div>

        {/* Profile Picture */}
        <div className="">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
              alt="Profile"
              className="w-40 h-40 rounded-full border-1 border-white shadow-lg"
            />
            <button className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full hover:bg-gray-300">
              <FaCamera className="text-gray-700" />
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between items-center">
          <div className="justify-center flex flex-col gap-2 text-center">
            <h1 className="text-4xl text-center justify-center font-bold text-gray-900">
              Twarimitswe Aaron
            </h1>
            {UserRole === "admin" && <h6>Admin</h6>}
            {UserRole === "student" && <h6>Student</h6>}
            {UserRole === "teacher" && <h6>Teacher</h6>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-200 cursor-pointer text-gray-700 px-4 py-2 my-3 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <MdEdit /> Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="">
          {/* Right Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">About Aaron</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Work and Education
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <FaBriefcase className="text-gray-500" />
                      <span>{workplace}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaGraduationCap className="text-gray-500" />
                      <span>{education}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Places lived</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <FaHome className="text-gray-500" />
                      <span>{currentCity}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-gray-500" />
                      <span>{hometown}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact info</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-gray-500" />
                      <span className="text-blue-600">{email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-gray-500" />
                      <span>{phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic info</h3>
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-gray-500" />
                    <span>{joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#00000099] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button onClick={() => setShowModal(false)}>
                <MdClose className="text-2xl text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="space-y-4 max-h-96 scroll-hide overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-2">Work</h4>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showWorkplace}
                    onChange={() => setShowWorkplace(!showWorkplace)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {editingWorkplace ? (
                    <div className="flex flex-col w-full">
                      <input
                        type="text"
                        value={newWorkplace}
                        onChange={(e) => setNewWorkplace(e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full"
                        placeholder="Enter workplace"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingWorkplace(false)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (newWorkplace.trim() !== "") {
                              setWorkplace(newWorkplace);
                              setEditingWorkplace(false);
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>{workplace}</span>
                      <button
                        onClick={startEditingWorkplace}
                        className="ml-auto text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </label>
                <button className="text-blue-600 hover:underline text-sm mt-1">
                  + Add workplace
                </button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Education</h4>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showEducation}
                    onChange={() => setShowEducation(!showEducation)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {editingEducation ? (
                    <div className="flex flex-col w-full">
                      <input
                        type="text"
                        value={newEducation}
                        onChange={(e) => setNewEducation(e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full"
                        placeholder="Enter education"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingEducation(false)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (newEducation.trim() !== "") {
                              setEducation(newEducation);
                              setEditingEducation(false);
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>{education}</span>
                      <button
                        onClick={startEditingEducation}
                        className="ml-auto text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </label>
                <button className="text-blue-600 hover:underline text-sm mt-1">
                  + Add education
                </button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Current city</h4>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showCurrentCity}
                    onChange={() => setShowCurrentCity(!showCurrentCity)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span>{currentCity}</span>
                </label>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Hometown</h4>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showHometown}
                    onChange={() => setShowHometown(!showHometown)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span>{hometown}</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4">
              <button
                onClick={() => {
                  setEditingWorkplace(false);
                  setEditingEducation(false);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileComponent;