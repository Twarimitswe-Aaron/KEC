import React, { useState } from "react";
import {
  useGetServiceRequestsQuery,
  useUpdateServiceRequestStatusMutation,
  useDeleteServiceRequestMutation,
} from "../state/api/authApi";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Wrench,
  FileText,
  Calendar,
  Trash2,
  Check,
  Play,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ServiceRequests() {
  const { data: requests, isLoading, refetch } = useGetServiceRequestsQuery();
  const [updateStatus] = useUpdateServiceRequestStatusMutation();
  const [deleteRequest] = useDeleteServiceRequestMutation();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Request marked as ${status.toLowerCase()}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update request status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service request?")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteRequest(id).unwrap();
      toast.success("Request deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete request");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-600 mt-2">
          Manage all equipment service requests from the landing page
        </p>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Wrench size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Service Requests Yet
          </h3>
          <p className="text-gray-500">
            Service requests from the landing page will appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request: any) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {request.serviceType === "INSTALLATION" ? (
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Wrench size={24} className="text-blue-600" />
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-100 rounded-full">
                      <FileText size={24} className="text-orange-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {request.name}
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    {request.serviceType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={16} className="text-gray-400" />
                  <span>{request.phone}</span>
                </div>
                {request.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    <span>{request.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  <span>
                    {request.province}, {request.district}, {request.sector}
                  </span>
                </div>
                {request.preferredDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {request.preferredDate} -{" "}
                      {request.preferredTime || "Anytime"}
                    </span>
                  </div>
                )}
              </div>

              {request.location && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Address:</span>{" "}
                    {request.location}
                  </p>
                </div>
              )}

              {request.serviceType === "INSTALLATION" &&
                request.installationDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Installation Details:
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.installationDetails}
                    </p>
                  </div>
                )}

              {request.serviceType === "REPAIR" && (
                <div className="space-y-3">
                  {request.equipmentDescription && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Equipment:
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.equipmentDescription}
                      </p>
                    </div>
                  )}
                  {request.problemDescription && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Problem Description:
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.problemDescription}
                      </p>
                    </div>
                  )}
                  {request.problemImage && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Problem Image:
                      </p>
                      <img
                        src={request.problemImage}
                        alt="Problem"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {request.urgencyLevel && (
                <div className="mt-4 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span
                    className={`text-sm font-semibold ${
                      request.urgencyLevel === "Emergency"
                        ? "text-red-600"
                        : request.urgencyLevel === "Urgent"
                        ? "text-orange-600"
                        : "text-gray-600"
                    }`}
                  >
                    Urgency: {request.urgencyLevel}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                {request.status === "PENDING" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(request.id, "IN_PROGRESS")
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                  >
                    <Play size={16} />
                    Approve & Start
                  </button>
                )}
                {request.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, "COMPLETED")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  >
                    <Check size={16} />
                    Mark as Done
                  </button>
                )}
                <button
                  onClick={() => handleDelete(request.id)}
                  disabled={deletingId === request.id}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {deletingId === request.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
