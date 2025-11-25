import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Search,
  Plus,
  MoreVertical,
  Filter,
  Download,
} from "lucide-react";
import StudentStatusList from "../Components/Certificate/StudentStatusList";
import CertificateCard from "../Components/Certificate/CertificateCard";

const CertificateManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: Award },
    { id: "requests", label: "Requests", icon: Clock },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "students", label: "Students", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 md:p-8 space-y-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Certificate Management
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage, issue, and track course certificates
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 transform hover:-translate-y-0.5 font-medium">
          <Plus className="w-5 h-5" />
          <span>Generate Certificates</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          {
            label: "Total Issued",
            value: "1,234",
            icon: Award,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            border: "border-blue-200/50",
          },
          {
            label: "Pending Approval",
            value: "56",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            border: "border-amber-200/50",
          },
          {
            label: "Templates",
            value: "8",
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
            border: "border-purple-200/50",
          },
          {
            label: "Graduated",
            value: "892",
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-500/10",
            border: "border-green-200/50",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/60 backdrop-blur-xl p-6 rounded-3xl border ${stat.border} shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-gray-200/30 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform origin-left">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform duration-300`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="relative z-10">
        <div className="flex space-x-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/40 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-md shadow-gray-200/50 scale-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                }
              `}
            >
              <tab.icon
                className={`w-4 h-4 ${
                  activeTab === tab.id ? "stroke-[2.5px]" : ""
                }`}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-gray-200/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Recent Activity
                    </h3>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 hover:bg-white/50 rounded-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/40"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                          JD
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900">
                            John Doe
                          </p>
                          <p className="text-sm text-gray-500">
                            Completed "Web Development Masterclass"
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full border border-green-200/50">
                            Issued
                          </span>
                          <p className="text-xs text-gray-400 mt-1">2h ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="space-y-6">
                {/* Filtration Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-6">
                  <div className="p-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      {/* Left Section - Filter */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Filter
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Filter:
                          </span>
                          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Types</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Right Section - Sort and Count */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            Sort by:
                          </span>
                          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                          </select>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="m3 8 4-4 4 4"></path>
                            <path d="M7 4v16"></path>
                            <path d="M11 12h4"></path>
                            <path d="M11 16h7"></path>
                            <path d="M11 20h10"></path>
                          </svg>
                        </button>
                        <div className="text-sm text-gray-500">
                          4 certificates found
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <CertificateCard key={i} status="PENDING" />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "students" && <StudentStatusList />}

            {activeTab === "templates" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="aspect-[1.414] bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300/50 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500/50 hover:text-blue-600 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group">
                  <div className="p-4 rounded-full bg-white/50 group-hover:bg-blue-100/50 transition-colors mb-4">
                    <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-lg">
                    Create New Template
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CertificateManagement;
