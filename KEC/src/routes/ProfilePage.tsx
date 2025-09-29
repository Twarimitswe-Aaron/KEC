import React from "react";
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetSpecificProfileQuery } from "../state/api/authApi";


const ProfileSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Banner + Avatar Skeleton */}
      <div className="relative overflow-hidden rounded-md">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative flex flex-col items-center gap-4 justify-center py-10 px-6">
          <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
          <div className="text-center space-y-3">
            <div className="h-5 w-44 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-28 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>

      {/* Details Skeleton */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />

              <div className="h-5 w-24 bg-gray-200 rounded mb-3 mt-6" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>

            <div className="space-y-6">
              <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />

              <div className="h-5 w-24 bg-gray-200 rounded mb-3 mt-6" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />

              <div className="h-5 w-24 bg-gray-200 rounded mb-3 mt-6" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : undefined;

  const { data: user, isLoading, isError } = useGetSpecificProfileQuery(userId!, {
    skip: !userId,
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-base">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner + Avatar */}
      <div className="relative overflow-hidden rounded-lg">
  {/* Gradient Background */}
  <div className="absolute inset-0  " />
  
  {/* Content */}
  <div className="relative flex flex-col items-center gap-6 justify-center py-16 px-8">
    <div className="relative group">
      <div className="relative">
        {user.profile?.avatar ? (
          <img
            src={user.profile.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-36 h-36 rounded-full border-4 border-white shadow-xl object-cover"
          />
        ) : (
          <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-xl text-3xl font-bold text-gray-600">
            {(user.firstName ?? "").charAt(0)}
            {(user.lastName ?? "").charAt(0)}
          </div>
        )}
      </div>
    </div>

    {/* Name & Role */}
    <div className="text-center space-y-3">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        {user.firstName} {user.lastName}
      </h1>
      <div
        className={`inline-flex border-[1px] border-slate-200 items-center px-4 py-2 rounded-full text-sm md:text-base font-medium ${
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
  </div>
</div>


      {/* Profile Details */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            About {user.lastName}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold mb-3 text-gray-800">Work</h3>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FaBriefcase className="text-blue-600 text-base" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.work || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3 text-gray-800">
                  Education
                </h3>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <FaGraduationCap className="text-emerald-600 text-base" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.education || "--"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold mb-3 text-gray-800">
                  Places Lived
                </h3>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <FaMapMarkerAlt className="text-orange-600 text-base" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.resident || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3 text-gray-800">
                  Contact Info
                </h3>
                <div className="flex items-center mb-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-gray-600 text-base" />
                  <span className="text-indigo-600 ml-3 font-medium text-sm">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-gray-600 text-base" />
                  <span className="text-gray-700 text-sm">
                    {user.profile?.phone || "--"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3 text-gray-800">
                  Basic Info
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-gray-600 text-base" />
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
    </div>
  );
};

export default ProfilePage;
