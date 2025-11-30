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
import { useUpdateProfileMutation } from "../state/api/authApi";
import { toast } from "react-toastify";
import { useUser } from "../hooks/useUser";
import {
  formatLocation,
  getProvinces,
  getDistricts,
  getSectors,
} from "../constants/rwanda-locations";

// Types
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profile?: {
    work?: string;
    education?: string;
    sector?: string;
    district?: string;
    province?: string;
    phone?: string;
    dateOfBirth?: string;
    avatar?: File;
  };
}

const ShimmerSkeletonLoader = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10"></div>

      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-md mx-4 mt-4">
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 relative flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-gray-300 border-4 border-white shadow-xl"></div>
            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gray-300"></div>
          </div>
          <div className="text-center space-y-2 w-full">
            <div className="h-6 bg-gray-300 rounded w-36 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
          </div>
          <div className="h-10 bg-gray-300 rounded w-28 mx-auto"></div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="h-7 bg-gray-300 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {["Work", "Education"].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-gray-300 rounded w-20"></div>
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded flex-1"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {["Places Lived", "Contact Info", "Basic Info"].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-gray-300 rounded w-24"></div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                      <div className="w-5 h-5 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded flex-1"></div>
                    </div>
                    {i === 1 && (
                      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded flex-1"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

const ProfileComponent = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updateProfile] = useUpdateProfileMutation();
  const { userData, isLoading } = useUser();

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
    profile: {
      work: "",
      education: "",
      sector: "",
      district: "",
      province: "",
      phone: "",
      dateOfBirth: "",
    },
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        profile: {
          work: userData.profile?.work || "",
          education: userData.profile?.education || "",
          sector: userData.profile?.sector || "",
          district: userData.profile?.district || "",
          province: userData.profile?.province || "",
          phone: userData.profile?.phone || "",
          dateOfBirth: userData.profile?.dateOfBirth || "",
        },
      });
      setAvatarPreview(userData.profile?.avatar || null);
    }
  }, [userData]);

  const handleModalClose = () => {
    setShowModal(false);
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        profile: {
          work: userData.profile?.work || "",
          education: userData.profile?.education || "",
          province: userData.profile?.province || "",
          district: userData.profile?.district || "",
          sector: userData.profile?.sector || "",
          phone: userData.profile?.phone || "",
          dateOfBirth: userData.profile?.dateOfBirth || "",
        },
      });
      setAvatarPreview(userData.profile?.avatar || null);
      setAvatarFile(null);
    }
  };

  const handleChange = (
    field: string,
    value: string,
    isProfileField: boolean = true
  ) => {
    if (isProfileField) {
      setFormData((prev) => {
        const updatedProfile = {
          ...prev.profile!,
          [field]: value,
        };

        // Cascading resets for location fields
        if (field === "province") {
          updatedProfile.district = "";
          updatedProfile.sector = "";
        } else if (field === "district") {
          updatedProfile.sector = "";
        }

        return {
          ...prev,
          profile: updatedProfile,
        };
      });
    } else {
      setFormData((prev) => ({
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
        { key: "lastName", label: "Last Name", isProfileField: false },
      ],
    },
    work: {
      title: "Work Information",
      fields: [
        { key: "work", label: "Work", isProfileField: true },
        { key: "education", label: "Education", isProfileField: true },
      ],
    },
    contact: {
      title: "Contact Information",
      fields: [
        { key: "phone", label: "Phone", isProfileField: true },
        { key: "province", label: "Province", isProfileField: true },
        { key: "district", label: "District", isProfileField: true },
        { key: "sector", label: "Sector", isProfileField: true },
      ],
    },
    basic: {
      title: "Basic Information",
      fields: [
        { key: "dateOfBirth", label: "Date of Birth", isProfileField: true },
      ],
    },
  };

  type SectionKey = keyof typeof sections;

  const renderProfileSection = (sectionKey: SectionKey) => {
    const section = sections[sectionKey];
    return (
      <div key={sectionKey} className="border border-gray-200 rounded-md p-3">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">
          {section.title}
        </h4>
        <div className="space-y-2">
          {section.fields.map((field) => {
            const rawValue = field.isProfileField
              ? formData.profile?.[
                  field.key as keyof UpdateProfileRequest["profile"]
                ] ?? ""
              : formData[
                  field.key as keyof Omit<UpdateProfileRequest, "profile">
                ] ?? "";
            const value =
              field.key === "dateOfBirth" && rawValue
                ? String(rawValue).slice(0, 10)
                : rawValue;

            if (
              field.key === "province" ||
              field.key === "district" ||
              field.key === "sector"
            ) {
              let options: string[] = [];
              let disabled = false;

              if (field.key === "province") {
                options = getProvinces();
              } else if (field.key === "district") {
                const currentProvince = formData.profile?.province;
                if (currentProvince) {
                  options = getDistricts(currentProvince);
                } else {
                  disabled = true;
                }
              } else if (field.key === "sector") {
                const currentProvince = formData.profile?.province;
                const currentDistrict = formData.profile?.district;
                if (currentProvince && currentDistrict) {
                  options = getSectors(currentProvince, currentDistrict);
                } else {
                  disabled = true;
                }
              }

              return (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.label}
                  </label>
                  <select
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    value={value}
                    onChange={(e) =>
                      handleChange(
                        field.key,
                        e.target.value,
                        field.isProfileField
                      )
                    }
                    disabled={disabled}
                  >
                    <option value="">Select {field.label}</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.key === "dateOfBirth" ? "date" : "text"}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  value={value}
                  onChange={(e) =>
                    handleChange(
                      field.key,
                      e.target.value,
                      field.isProfileField
                    )
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatarFile(null);
    setAvatarPreview(userData?.profile?.avatar || null);
  };

  const saveProfile = async () => {
    try {
      setIsRefreshing(true);
      const formDataToSend = new FormData();

      if (formData.firstName)
        formDataToSend.append("firstName", formData.firstName);
      if (formData.lastName)
        formDataToSend.append("lastName", formData.lastName);

      // Append profile fields as a JSON string
      const profileData: { [key: string]: string } = {};
      if (formData.profile?.work) profileData.work = formData.profile.work;
      if (formData.profile?.education)
        profileData.education = formData.profile.education;
      if (formData.profile?.province)
        profileData.province = formData.profile.province;
      if (formData.profile?.district)
        profileData.district = formData.profile.district;
      if (formData.profile?.sector)
        profileData.sector = formData.profile.sector;
      if (formData.profile?.phone) profileData.phone = formData.profile.phone;
      if (formData.profile?.dateOfBirth)
        profileData.dateOfBirth = formData.profile.dateOfBirth;

      if (Object.keys(profileData).length > 0) {
        formDataToSend.append("profile", JSON.stringify(profileData));
        if (profileData.dateOfBirth) {
          profileData.dateOfBirth = new Date(
            profileData.dateOfBirth
          ).toISOString();
        }
      }

      // Append avatar file
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const response = await updateProfile(formDataToSend).unwrap();
      if (response) {
        toast.success("Profile updated successfully!");
        setShowModal(false);
        setAvatarFile(null);
      }
    } catch (err: any) {
      console.error("Update error:", err);
      if (err?.data?.message?.includes("CSRF") || err?.status === 403) {
        toast.error(
          "Security token expired. Please refresh the page and try again."
        );
      } else {
        toast.error(err?.data?.message || "Failed to update profile");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const user = userData || {
    id: 0,
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    isEmailVerified: false,
    profile: null,
  };

  if (isLoading || isRefreshing) {
    return <ShimmerSkeletonLoader />;
  }

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden rounded-md">
        <div className="absolute inset-0 " />
        <div className="relative flex flex-col items-center gap-6 justify-center py-16 px-8">
          <div className="relative group">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
              ) : user.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-xl text-4xl font-semibold text-gray-600">
                  {(user.firstName ?? "").charAt(0)}
                  {(user.lastName ?? "").charAt(0)}
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

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </h1>
            <div
              className={`inline-flex border-[1px] border-slate-200 items-center px-4 py-2 rounded-full text-sm font-medium ${
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

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            About {user.lastName}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">Work</h3>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <FaBriefcase className="text-blue-600 text-sm" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.work || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  Education
                </h3>
                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                  <FaGraduationCap className="text-emerald-600 text-sm" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.education || "--"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  Places Lived
                </h3>
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <FaMapMarkerAlt className="text-orange-600 text-sm" />
                  <span className="text-gray-700 text-sm">
                    {formatLocation(
                      user.profile?.sector || "",
                      user.profile?.district || "",
                      user.profile?.province || ""
                    ) || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  Contact Info
                </h3>
                <div className="flex items-center mb-2 p-2 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-gray-600 text-sm" />
                  <span className="text-indigo-600 ml-2 font-medium text-sm">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FaPhone className="text-gray-600 text-sm" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.phone || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  Basic Info
                </h3>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-gray-600 text-sm" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.dateOfBirth
                      ? new Date(user.profile.dateOfBirth).toLocaleDateString()
                      : "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#00000090] flex justify-center items-center z-50 p-2">
          <div className="bg-white rounded-md w-full max-w-xl max-h-[85vh] shadow-xl overflow-hidden">
            {/* Header */}
            <div className="text-black p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Edit Your Profile</h3>
                <button
                  onClick={handleModalClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdClose className="text-xl cursor-pointer" />
                </button>
              </div>
              <p className="text-gray-600 mt-1 text-sm">
                Update your information and showcase your achievements
              </p>
            </div>

            {/* Body */}
            <div className="p-4 max-h-[calc(85vh-160px)] overflow-y-auto scroll-hide space-y-3">
              {/* Profile Photo */}
              <div className="border border-gray-200 rounded-md p-3">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">
                  Profile Photo
                </h4>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : user.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt="Current"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 text-base font-semibold text-gray-600">
                        {(user.firstName ?? "").charAt(0)}
                        {(user.lastName ?? "").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label
                      htmlFor="modal-avatar-upload"
                      className="bg-[#034153] text-white px-3 py-1.5 rounded-md cursor-pointer text-sm hover:bg-[#052f40] transition-colors"
                    >
                      Change
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
                        className="bg-gray-200 cursor-pointer text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 200x200 pixels, max 2MB
                </p>
              </div>

              {Object.keys(sections).map((sectionKey) =>
                renderProfileSection(sectionKey as SectionKey)
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 cursor-pointer bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={isRefreshing}
                  className="px-4 cursor-pointer py-2 bg-[#034153] text-white rounded-md transition-all duration-300 font-medium shadow flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
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
