import React from "react";
import {
  useGetActiveSessionsQuery,
  useMarkAttendanceMutation,
} from "../../state/api/attendanceApi";
import { Users, CheckCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface StudentAttendanceProps {
  courseId: number;
  studentId: number;
}

const StudentAttendance: React.FC<StudentAttendanceProps> = ({
  courseId,
  studentId,
}) => {
  const {
    data: activeSessions = [],
    isLoading,
    refetch,
  } = useGetActiveSessionsQuery(courseId);
  const [markAttendance, { isLoading: isMarking }] =
    useMarkAttendanceMutation();

  const handleMarkAttendance = async (sessionId: number) => {
    try {
      await markAttendance(sessionId).unwrap();
      toast.success("Attendance marked successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to mark attendance");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (activeSessions.length === 0) {
    return null; // Don't show anything if no active sessions
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Users className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Active Attendance</h3>
          <p className="text-sm text-gray-600">
            Mark your attendance for active sessions
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {activeSessions.map((session: any) => {
          const isAttended = session.records?.some(
            (record: any) => record.studentId === studentId
          );

          return (
            <div
              key={session.id}
              className="bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      Session Started:{" "}
                      {session.createdAt
                        ? format(new Date(session.createdAt), "MMM d, h:mm a")
                        : "Unknown Time"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Click the button to confirm your attendance
                  </p>
                </div>

                <button
                  onClick={() => handleMarkAttendance(session.id)}
                  disabled={isAttended || isMarking}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isAttended
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                  }`}
                >
                  {isAttended ? (
                    <>
                      <CheckCircle size={18} />
                      Attended
                    </>
                  ) : isMarking ? (
                    "Marking..."
                  ) : (
                    <>
                      <Users size={18} />
                      Confirm Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentAttendance;
