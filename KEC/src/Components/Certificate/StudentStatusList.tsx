import React, { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  GraduationCap,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const StudentStatusList = () => {
  const [filter, setFilter] = useState("all");

  const students = [
    {
      id: 1,
      name: "Alice Johnson",
      course: "Web Development",
      status: "graduated",
      progress: 100,
    },
    {
      id: 2,
      name: "Bob Smith",
      course: "Data Science",
      status: "learning",
      progress: 45,
    },
    {
      id: 3,
      name: "Charlie Brown",
      course: "UX Design",
      status: "failed",
      progress: 20,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graduated":
        return "bg-green-100/50 text-green-700 border-green-200/50";
      case "learning":
        return "bg-blue-100/50 text-blue-700 border-blue-200/50";
      case "failed":
        return "bg-red-100/50 text-red-700 border-red-200/50";
      default:
        return "bg-gray-100/50 text-gray-700 border-gray-200/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "graduated":
        return GraduationCap;
      case "learning":
        return BookOpen;
      case "failed":
        return AlertCircle;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white/40 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-transparent focus:border-blue-300/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 px-2">
          {["all", "graduated", "learning", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-all duration-300 ${
                filter === status
                  ? "bg-white text-blue-600 shadow-md shadow-gray-200/50"
                  : "text-gray-500 hover:bg-white/40 hover:text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-gray-200/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50 text-left">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Student
              </th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Course
              </th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {students.map((student) => {
              const StatusIcon = getStatusIcon(student.status);
              return (
                <tr
                  key={student.id}
                  className="hover:bg-white/40 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 shadow-sm group-hover:scale-110 transition-transform">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-600 font-medium">
                    {student.course}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        student.status
                      )}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="capitalize">{student.status}</span>
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200/50 rounded-full overflow-hidden w-24">
                        <div
                          className={`h-full rounded-full ${
                            student.status === "failed"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentStatusList;
