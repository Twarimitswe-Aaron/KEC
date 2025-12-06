import React, { useState } from "react";
import { X, Users, Clock, CheckCircle, Download } from "lucide-react";
import {
  useCreateAttendanceSessionMutation,
  useMarkAttendanceMutation,
  useGetActiveSessionsQuery,
  useGetSessionRecordsQuery,
  useCloseSessionMutation,
  useExportToExcelMutation,
  AttendanceStatus,
} from "../state/api/attendanceApi";
import { toast } from "react-toastify";

interface AttendanceManagerProps {
  courseId: number;
  userRole: "admin" | "teacher" | "student";
  userId: number;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  courseId,
  userRole,
  userId,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [sessionTitle, setSessionTitle] = useState("");

  const { data: activeSessions, refetch: refetchActiveSessions } =
    useGetActiveSessionsQuery(courseId);
  const [createSession, { isLoading: isCreating }] =
    useCreateAttendanceSessionMutation();
  const [markAttendance, { isLoading: isMarking }] =
    useMarkAttendanceMutation();
  const [closeSession] = useCloseSessionMutation();
  const [exportToExcel] = useExportToExcelMutation();

  const { data: sessionRecords } = useGetSessionRecordsQuery(
    selectedSessionId || 0,
    {
      skip: !selectedSessionId,
    }
  );

  const handleCreateSession = async () => {
    try {
      await createSession({
        courseId,
        title: sessionTitle || "Attendance",
      }).unwrap();
      toast.success("Attendance session created successfully!");
      setShowCreateModal(false);
      setSessionTitle("");
      refetchActiveSessions();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to create attendance session"
      );
    }
  };

  const handleMarkAttendance = async (sessionId: number) => {
    try {
      await markAttendance(sessionId).unwrap();
      toast.success("Attendance marked successfully!");
      refetchActiveSessions();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to mark attendance");
    }
  };

  const handleCloseSession = async (sessionId: number) => {
    try {
      await closeSession(sessionId).unwrap();
      toast.success("Attendance session closed!");
      refetchActiveSessions();
      setShowRecordsModal(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to close session");
    }
  };

  const handleExportToExcel = async (sessionId: number) => {
    try {
      const blob = await exportToExcel(sessionId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${sessionId}-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Attendance exported successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to export attendance");
    }
  };

  const handleViewRecords = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setShowRecordsModal(true);
  };

  // Teacher/Admin View
  if (userRole === "admin" || userRole === "teacher") {
    return (
      <>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#004e64] to-[#025a73] text-white px-4 py-2 rounded-xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
          >
            <Users size={18} />
            Create Attendance
          </button>
        </div>

        {/* Active Sessions Display */}
        {activeSessions && activeSessions.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Clock size={18} />
              Active Attendance Sessions ({activeSessions.length})
            </h3>
            <div className="space-y-2">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{session.title}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewRecords(session.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      View Records
                    </button>
                    <button
                      onClick={() => handleExportToExcel(session.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <Download size={14} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleCloseSession(session.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Attendance Session
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g., Lecture 1 Attendance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004e64]"
                  />
                </div>

                <button
                  onClick={handleCreateSession}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-[#004e64] to-[#025a73] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Session"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Records Modal */}
        {showRecordsModal && sessionRecords && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {sessionRecords.session.title}
                </h2>
                <button
                  onClick={() => setShowRecordsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {sessionRecords.summary.totalStudents}
                    </p>
                    <p className="text-sm text-gray-600">Total Students</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {sessionRecords.summary.present}
                    </p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {sessionRecords.summary.absent}
                    </p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Student Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-left">Time Marked</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionRecords.attendanceList.map((record) => (
                    <tr
                      key={record.studentId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{record.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.email}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record.present ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            Present
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.markedAt
                          ? new Date(record.markedAt).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  }

  // Student View
  return (
    <>
      {activeSessions && activeSessions.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle size={18} />
            Mark Your Attendance
          </h3>
          <div className="space-y-2">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">{session.title}</p>
                  <p className="text-sm text-gray-500">
                    Click "Attend" to mark your presence
                  </p>
                </div>
                <button
                  onClick={() => handleMarkAttendance(session.id)}
                  disabled={isMarking}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMarking ? "Marking..." : "Attend"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceManager;
