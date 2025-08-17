import React, { useContext, useState } from "react";
import {
  FaHome,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaCamera,
  FaPlus,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { MdClose, MdEdit, MdDelete } from "react-icons/md";
import { IconType } from "react-icons";

// Types
type SectionKey = "work" | "education" | "currentCity" | "hometown";

interface UserProfile {
  id: number;
  name: string;
  role: string;
  avatar: string;
  joinDate: string;
  email: string;
  phone: string;
  work: string[];
  education: string[];
  currentCity: string[];
  hometown: string[];
}

interface SectionConfig {
  title: string;
  icon: IconType;
  data: string[];
  setData: (newData: string[]) => void;
  placeholder: string;
  color: string;
}

// Context (mock for demo)
const UserRoleContext = React.createContext("admin");

const ProfileComponent = () => {
  const userRole = useContext(UserRoleContext);
  
  // Unified user state
  const [user, setUser] = useState<UserProfile>({
    id: 1,
    name: "Twarimitswe Aaron",
    role: userRole,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    joinDate: "Joined June 27, 2007",
    email: "aarontwarimitswe@gmail.com",
    phone: "+250 784 156 865",
    work: ["Work in the new Technology Company"],
    education: ["Studied in Kigali Secondary Education"],
    currentCity: ["Lives in Gasabo, Rwanda"],
    hometown: ["From Kigali, Gasabo, Rwanda"],
  });

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempValue, setTempValue] = useState("");

  // Section configurations
  const sections: Record<SectionKey, SectionConfig> = {
    work: {
      title: "Work",
      icon: FaBriefcase,
      data: user.work,
      setData: (newData) => setUser({ ...user, work: newData }),
      placeholder: "Add workplace...",
      color: "from-blue-500 to-indigo-600"
    },
    education: {
      title: "Education",
      icon: FaGraduationCap,
      data: user.education,
      setData: (newData) => setUser({ ...user, education: newData }),
      placeholder: "Add education...",
      color: "from-emerald-500 to-teal-600"
    },
    currentCity: {
      title: "Current City",
      icon: FaHome,
      data: user.currentCity,
      setData: (newData) => setUser({ ...user, currentCity: newData }),
      placeholder: "Add current city...",
      color: "from-purple-500 to-pink-600"
    },
    hometown: {
      title: "Hometown",
      icon: FaMapMarkerAlt,
      data: user.hometown,
      setData: (newData) => setUser({ ...user, hometown: newData }),
      placeholder: "Add hometown...",
      color: "from-orange-500 to-red-600"
    }
  };

  // Handlers
  const handleAddItem = (sectionKey: SectionKey) => {
    if (tempValue.trim()) {
      sections[sectionKey].setData([...sections[sectionKey].data, tempValue.trim()]);
      setTempValue("");
      setActiveSection(null);
    }
  };

  const handleEditItem = (sectionKey: SectionKey, index: number) => {
    if (tempValue.trim()) {
      const newData = [...sections[sectionKey].data];
      newData[index] = tempValue.trim();
      sections[sectionKey].setData(newData);
    }
    setEditingIndex(-1);
    setTempValue("");
  };

  const handleDeleteItem = (sectionKey: SectionKey, index: number) => {
    sections[sectionKey].setData(
      sections[sectionKey].data.filter((_, i) => i !== index)
    );
  };

  const startEditing = (sectionKey: SectionKey, index: number, currentValue: string) => {
    setEditingIndex(index);
    setActiveSection(sectionKey);
    setTempValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingIndex(-1);
    setActiveSection(null);
    setTempValue("");
  };

  const handleModalClose = () => {
    setShowModal(false);
    cancelEditing();
  };

  const saveProfile = () => {
    console.log("Saving profile:", user);
    // API call would go here
    handleModalClose();
  };

  // Render a section in edit modal
  const renderProfileSection = (sectionKey: SectionKey) => {
    const { title, icon: Icon, data, placeholder, color } = sections[sectionKey];
    
    return (
      <div key={sectionKey} className="space-y-3 ">
   

        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="group">
              {editingIndex === index && activeSection === sectionKey ? (
                <div className="flex items-center gap-2 p-3 bg-white rounded-md border-2 border-blue-200 shadow-sm">
                  <Icon className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 outline-none text-gray-700"
                    placeholder={placeholder}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditItem(sectionKey, index);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditItem(sectionKey, index)}
                      className="p-1 text-green-500 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-md border border-gray-100 hover:shadow-md transition-all duration-300 group-hover:border-gray-200">
                  <Icon className="text-gray-500 flex-shrink-0" />
                  <span className="flex-1 text-gray-700">{item}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => startEditing(sectionKey, index, item)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <MdEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(sectionKey, index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <MdDelete size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {activeSection === sectionKey && editingIndex === -1 && (
          <div className="animate-fadeInUp">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <Icon className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400"
                placeholder={placeholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem(sectionKey);
                  if (e.key === 'Escape') cancelEditing();
                }}
              />
              <div className="flex gap-1">
                <button
                  onClick={() => handleAddItem(sectionKey)}
                  className="p-1 text-green-500 hover:bg-green-50 rounded-md transition-colors"
                  disabled={!tempValue.trim()}
                >
                  <FaCheck size={12} />
                </button>
                <button
                  onClick={cancelEditing}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className=" min-h-screen">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-md">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50">

        </div>
        
        <div className="relative flex flex-col items-center gap-6 justify-center py-16 px-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-300 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-white shadow-xl"
              />
              <button className="absolute cursor-pointer bottom-2 right-2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 border border-gray-100">
                <FaCamera className="text-gray-700" />
              </button>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {user.name}
            </h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              user.role === 'admin' ? 'bg-yellow-100 text-yellow-800' :
              user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#034153] cursor-pointer text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <MdEdit className="text-md" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-8 ">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            About {user.name.split(" ")[0]}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Work */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Work</h3>
                <div className="space-y-3">
                  {user.work.map((place, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <FaBriefcase className="text-blue-600" />
                      <span className="text-gray-700">{place}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Education</h3>
                <div className="space-y-3">
                  {user.education.map((place, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                      <FaGraduationCap className="text-emerald-600" />
                      <span className="text-gray-700">{place}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Places Lived */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Places Lived</h3>
                <div className="space-y-3">
                  {user.currentCity.map((city, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <FaHome className="text-purple-600" />
                      <span className="text-gray-700">{city}</span>
                    </div>
                  ))}
                  {user.hometown.map((town, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                      <FaMapMarkerAlt className="text-orange-600" />
                      <span className="text-gray-700">{town}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <FaEnvelope className="text-gray-600" />
                    <span className="text-indigo-600 font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <FaPhone className="text-gray-600" />
                    <span className="text-gray-700">{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Basic Info</h3>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <FaCalendarAlt className="text-gray-600" />
                  <span className="text-gray-700">{user.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-md w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className=" text-black p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Edit Your Profile</h3>
                <button
                  onClick={handleModalClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <MdClose className="text-2xl cursor-pointer" />
                </button>
              </div>
              <p className="text-black mt-2">Update your information and showcase your achievements</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto space-y-4">
              {Object.keys(sections).map(sectionKey => 
                renderProfileSection(sectionKey as SectionKey)
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-2 bg-gray-50">
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleModalClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  className="px-6 py-3 bg-[#034153]  text-white rounded-md cursor-pointer transition-all duration-300 font-medium shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ProfileComponent;