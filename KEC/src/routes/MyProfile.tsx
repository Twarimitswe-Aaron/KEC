import React, { useState } from "react";
import {
  FaUser,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaHome,
  FaGraduationCap,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { CiEdit } from "react-icons/ci";

const MyProfile: React.FC = () => {
  const [name, setName] = useState("Twarimitswe Aaron");
  const [role, setRole] = useState("Student");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("June 27, 2007");
  const [currentLocation, setCurrentLocation] = useState("Kigali-Gasabo Kinyinya");
  const [origin, setOrigin] = useState("Kigali-Gasabo Bumbogo");
  const [education, setEducation] = useState("Ecole Secondaire Kanombe");
  const [work, setWork] = useState("New Technology Company");
  const [email, setEmail] = useState("aarontwarimitswe@gmail.com");
  const [phone, setPhone] = useState("+250 784 156 866");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saved Profile:", {
      name, role, gender, dob, currentLocation, origin,
      education, work, email, phone, isPrivate,
    });
  };

  const ProfileField: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    onEdit: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditable: boolean;
  }> = ({ icon, label, value, onEdit, isEditable }) => (
    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="text-[#004e64] text-xl">{icon}</div>
      {isEditable ? (
        <input
          type="text"
          value={value}
          onChange={onEdit}
          className="flex-grow bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#004e64] text-sm text-gray-800"
        />
      ) : (
        <p className="text-gray-800 text-sm">{value}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-gradient-to-br from-white via-[#f0faff] to-white rounded-3xl shadow-xl border border-[#e6f4f1]">
      {/* Header Buttons */}
      <div className="flex justify-end mb-6">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-[#004e64] text-white px-5 py-2 rounded-full shadow hover:bg-[#003a4c] transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[#004e64] hover:text-[#003a4c] flex items-center text-sm font-medium transition"
          >
            <CiEdit className="text-xl mr-1" />
            Edit
          </button>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=004e64&color=ffffff&size=128&rounded=true`}
          alt="User Avatar"
          className="w-32 h-32 rounded-full shadow-lg border-4 border-white"
        />
        <h2 className="text-3xl font-bold text-[#004e64] mt-4">
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#004e64]"
            />
          ) : (
            name
          )}
        </h2>
        <p className="text-lg text-gray-600 mt-1">
          {isEditing ? (
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-center border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#004e64]"
            />
          ) : (
            role
          )}
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <ProfileField icon={<FaUser />} label="Gender" value={gender} onEdit={(e) => setGender(e.target.value)} isEditable={isEditing} />
        <ProfileField icon={<FaBirthdayCake />} label="DOB" value={dob} onEdit={(e) => setDob(e.target.value)} isEditable={isEditing} />
        <ProfileField icon={<FaMapMarkerAlt />} label="Current Location" value={currentLocation} onEdit={(e) => setCurrentLocation(e.target.value)} isEditable={isEditing} />
        <ProfileField icon={<FaHome />} label="Origin" value={origin} onEdit={(e) => setOrigin(e.target.value)} isEditable={isEditing} />
        <ProfileField icon={<FaGraduationCap />} label="Education" value={education} onEdit={(e) => setEducation(e.target.value)} isEditable={isEditing} />
        <ProfileField icon={<FaBriefcase />} label="Work" value={work} onEdit={(e) => setWork(e.target.value)} isEditable={isEditing} />
        <ProfileField icon={<FaEnvelope />} label="Email" value={email} onEdit={(e) => setEmail(e.target.value)} isEditable={isEditing} />
        <ProfileField icon={<FaPhone />} label="Phone" value={phone} onEdit={(e) => setPhone(e.target.value)} isEditable={isEditing} />
      </div>

      {/* Privacy Toggle */}
      <div className="mt-6">
        <label htmlFor="private-toggle" className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="private-toggle"
              className="sr-only"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
              disabled={!isEditing}
            />
            <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                isPrivate ? "translate-x-6 bg-[#004e64]" : ""
              }`}
            ></div>
          </div>
          <span className="ml-4 text-gray-700 font-medium text-sm">
            Make your account private
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-1">
          Only you and trusted platforms can access this data.
        </p>
      </div>
    </div>
  );
};

export default MyProfile;
