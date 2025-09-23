import React, { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaCamera,
} from "react-icons/fa";
import { MdClose, MdEdit } from "react-icons/md";
import {
  useGetUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} from "../state/api/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Types
interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  profile: {
    avatar?: string;
    Work?: string;
    Education?: string;
    resident?: string;
    phone?: string;
    createdAt?: string;
  } | null;
}

// Interface that matches what your backend expects
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profile?: {
    Work?: string;
    Education?: string;
    resident?: string;
    phone?: string;
    createdAt?: string;
    avatar?: string;
  };
}

const ProfileComponent = () => {
  const [updateProfile] = useUpdateProfileMutation();
  const [logout, setLogout] = useState(false);
  const { data, isLoading, refetch } = useGetUserQuery();
  const [logoutUser] = useLogoutMutation();
  const navigate = useNavigate();

  // Initialize formData with the structure your backend expects
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
    profile: {
      Work: "",
      Education: "",
      resident: "",
      phone: "",
      createdAt: "",
    }
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  // Use local state to track the current user data for real-time updates
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Update currentUser when data changes
  useEffect(() => {
    if (data) {
      const userData: UserProfile = {
        id: data.id || 0,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        role: data.role || "",
        email: data.email || "",
        isEmailVerified: data.isEmailVerified || false,
        profile: data.profile ? {
          avatar: data.profile.avatar,
          Work: data.profile.Work || data.profile.Work, // Handle both cases
          Education: data.profile.Education || data.profile.Education,
          resident: data.profile.resident,
          phone: data.profile.phone,
          createdAt: data.profile.createdAt,
        } : null,
      };
      setCurrentUser(userData);

      // Initialize form data
      const initialFormData: UpdateProfileRequest = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        profile: {
          Work: data.profile?.Work || data.profile?.Work || "",
          Education: data.profile?.Education || data.profile?.Education || "",
          resident: data.profile?.resident || "",
          phone: data.profile?.phone || "",
          createdAt: data.profile?.createdAt || "",
        }
      };
      setFormData(initialFormData);
      
      if (data.profile?.avatar) {
        setAvatarPreview(data.profile.avatar);
      }
    }
  }, [data]);

  // Handle unauthorized
  useEffect(() => {
    if (!isLoading && !data && !logout) {
      logoutUser();
      setLogout(true);
      window.location.href = "/login";
    }
  }, [isLoading, data, logout, logoutUser]);

  // Handle email not verified
  useEffect(() => {
    if (data && !data.isEmailVerified) {
      setTimeout(() => {
        toast.error("Your email is not verified. Please check your email!", {
          autoClose: 5000,
        });
      }, 1500);
    }
  }, [data, navigate]);

  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
    if (data) {
      const resetFormData: UpdateProfileRequest = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        profile: {
          Work: data.profile?.Work || data.profile?.Work || "",
          Education: data.profile?.Education || data.profile?.Education || "",
          resident: data.profile?.resident || "",
          phone: data.profile?.phone || "",
          createdAt: data.profile?.createdAt || "",
        }
      };
      setFormData(resetFormData);
      
      if (data.profile?.avatar) {
        setAvatarPreview(data.profile.avatar);
        setAvatarBase64(null);
      } else {
        setAvatarPreview(null);
        setAvatarBase64(null);
      }
    }
    setAvatarFile(null);
  };

  const handleChange = (field: string, value: string, isProfileField: boolean = true) => {
    if (isProfileField) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          [field]: value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const sections = {
    personal: {
      title: "Personal Information",
      fields: [
        { key: "firstName", label: "First Name", isProfileField: false },
        { key: "lastName", label: "Last Name", isProfileField: false }
      ],
    },
    Work: { 
      title: "Work Information", 
      fields: [
        { key: "Work", label: "Work", isProfileField: true },
        { key: "Education", label: "Education", isProfileField: true }
      ] 
    },
    contact: { 
      title: "Contact Information", 
      fields: [
        { key: "phone", label: "Phone", isProfileField: true },
        { key: "resident", label: "Resident", isProfileField: true }
      ] 
    },
    basic: { 
      title: "Basic Information", 
      fields: [
        { key: "createdAt", label: "Date of Birth", isProfileField: true }
      ] 
    },
  };

  type SectionKey = keyof typeof sections;

  const renderProfileSection = (sectionKey: SectionKey) => {
    const section = sections[sectionKey];
    return (
      <div key={sectionKey} className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">{section.title}</h4>
        <div className="space-y-3">
          {section.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.key === "createdAt" ? "date" : "text"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={
                  field.isProfileField 
                    ? formData.profile?.[field.key as keyof typeof formData.profile] || ""
                    : formData[field.key as keyof Omit<UpdateProfileRequest, 'profile'>] || ""
                }
                onChange={(e) => handleChange(field.key, e.target.value, field.isProfileField)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Image Upload with Preview and Base64 conversion
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      setAvatarFile(file);
      setImageError(false);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setAvatarBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatarFile(null);
    setAvatarBase64(null);
    if (data?.profile?.avatar) {
      setAvatarPreview(data.profile.avatar);
    } else {
      setAvatarPreview(null);
    }
  };

  // Save Profile - Using regular object instead of FormData
  const saveProfile = async () => {
    try {
      // Prepare the data object that matches your backend expectations
      const requestData: UpdateProfileRequest = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        profile: {
          Work: formData.profile?.Work || undefined,
          Education: formData.profile?.Education || undefined,
          resident: formData.profile?.resident || undefined,
          phone: formData.profile?.phone || undefined,
          createdAt: formData.profile?.createdAt || undefined,
          avatar: avatarBase64 || undefined,
        }
      };

      // Remove empty fields to avoid sending undefined
      Object.keys(requestData).forEach(key => {
        if (requestData[key as keyof UpdateProfileRequest] === undefined) {
          delete requestData[key as keyof UpdateProfileRequest];
        }
      });

      if (requestData.profile) {
        Object.keys(requestData.profile).forEach(key => {
          if (requestData.profile![key as keyof typeof requestData.profile] === undefined) {
            delete requestData.profile![key as keyof typeof requestData.profile];
          }
        });
      }

      // If profile object is empty, remove it
      if (requestData.profile && Object.keys(requestData.profile).length === 0) {
        delete requestData.profile;
      }

      console.log("Sending data to backend:", requestData);

      // Send to backend as regular JSON object
      const result = await updateProfile(requestData).unwrap();

      toast.success("Profile updated successfully!");
      
      // Force a refetch and wait for it to complete
      await refetch();
      
      // Update local state immediately with the new data
      if (data) {
        const updatedUser: UserProfile = {
          ...currentUser!,
          firstName: formData.firstName || currentUser?.firstName || "",
          lastName: formData.lastName || currentUser?.lastName || "",
          profile: {
            ...currentUser?.profile,
            Work: formData.profile?.Work || currentUser?.profile?.Work || "",
            Education: formData.profile?.Education || currentUser?.profile?.Education || "",
            resident: formData.profile?.resident || currentUser?.profile?.resident || "",
            phone: formData.profile?.phone || currentUser?.profile?.phone || "",
            createdAt: formData.profile?.createdAt || currentUser?.profile?.createdAt || "",
            avatar: avatarBase64 ? avatarBase64 : currentUser?.profile?.avatar,
          }
        };
        setCurrentUser(updatedUser);
      }
      
      setShowModal(false);
      setAvatarFile(null);
      setAvatarBase64(null);
      
    } catch (err: any) {
      console.error("Update error:", err);
      
      if (err?.data?.message?.includes('CSRF') || err?.status === 403) {
        toast.error("Security token expired. Please refresh the page and try again.");
      } else {
        toast.error(err?.data?.message || "Failed to update profile");
      }
    }
  };

  // Use currentUser instead of creating user object from data each time
  const user = currentUser || {
    id: 0,
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    isEmailVerified: false,
    profile: null,
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-md">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative flex flex-col items-center gap-6 justify-center py-16 px-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
              ) : !imageError && user.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  onError={() => setImageError(true)}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-xl text-4xl font-semibold text-gray-600">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <FaCamera className="text-gray-700" />
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </h1>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                user.role === "admin"
                  ? "bg-yellow-100 text-yellow-800"
                  : user.role === "teacher"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {user.role}
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#034153] text-white px-4 py-2 rounded-md hover:bg-[#052f40] flex items-center gap-3 shadow-lg transition-all"
          >
            <MdEdit className="text-md" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-8 mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            About {user.lastName}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Work</h3>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <FaBriefcase className="text-blue-600" />
                  <span className="text-gray-700">
                    {user.profile?.Work || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Education
                </h3>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <FaGraduationCap className="text-emerald-600" />
                  <span className="text-gray-700">
                    {user.profile?.Education || "--"}
                  </span>
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Places Lived
                </h3>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <FaMapMarkerAlt className="text-orange-600" />
                  <span className="text-gray-700">
                    {user.profile?.resident || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Contact Info
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaEnvelope className="text-gray-600" />
                  <span className="text-indigo-600 font-medium">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaPhone className="text-gray-600" />
                  <span className="text-gray-700">
                    {user.profile?.phone || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Basic Info
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaCalendarAlt className="text-gray-600" />
                  <span className="text-gray-700">
                    {user.profile?.createdAt
                      ? new Date(user.profile.createdAt).toLocaleDateString()
                      : "--"}
                  </span>
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
              <p className="text-black mt-2">
                Update your information and showcase your achievements
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto space-y-4">
              {/* Avatar Upload Section in Modal */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Profile Photo</h4>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : user.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt="Current"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 text-lg font-semibold text-gray-600">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <label
                      htmlFor="modal-avatar-upload"
                      className="bg-[#034153] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#052f40] transition-colors"
                    >
                      Change Photo
                    </label>
                    <input
                      type="file"
                      id="modal-avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {(avatarFile || avatarPreview !== user.profile?.avatar) && (
                      <button
                        onClick={handleRemoveImage}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Recommended: Square image, at least 200x200 pixels, max 5MB
                </p>
              </div>

              {/* Other sections */}
              {Object.keys(sections).map((sectionKey) =>
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
                  className="px-6 py-3 bg-[#034153] text-white rounded-md cursor-pointer transition-all duration-300 font-medium shadow-lg"
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