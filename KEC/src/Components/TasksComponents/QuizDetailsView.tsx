import React, { useEffect, useState } from "react";
import { ArrowLeft, Users, BarChart3, TrendingUp } from "lucide-react";
import {
  useGetQuizParticipantsQuery,
  useUpdateManualMarksMutation,
  useUploadStudentMarksFileMutation,
} from "../../state/api/quizApi";
import StudentMarksUploader from "./StudentMarksUploader";

interface QuizDetailsViewProps {
  selectedQuizDetails: any;
  onBack: () => void;
  getGradeColor: (percentage: number) => string;
  getLetterGrade: (percentage: number) => string;
}

const QuizDetailsView: React.FC<QuizDetailsViewProps> = ({
  selectedQuizDetails,
  onBack,
  getGradeColor,
  getLetterGrade,
}) => {
  if (!selectedQuizDetails) {
    return null;
  }

  const { quiz, courseId } = selectedQuizDetails;
  const quizId = Number(quiz?.id) || 0;
  const courseIdNum = Number(courseId) || 0;
  const { data: liveParticipants, refetch } = useGetQuizParticipantsQuery(
    { quizId, courseId: courseIdNum },
    { skip: !(quizId && courseIdNum) }
  );

  const students = Array.isArray(liveParticipants)
    ? liveParticipants
    : Array.isArray(quiz.students)
    ? quiz.students
    : [];
  const quizType = String(quiz?.type || "").toLowerCase();
  const isEditableQuiz = quizType !== "online";
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Record<number, { mark: number }>>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<number, File | null>
  >({});
  const [updateManualMarks, { isLoading: isSaving }] =
    useUpdateManualMarksMutation();
  const [uploadStudentMarksFile] = useUploadStudentMarksFileMutation();

  useEffect(() => {
    const init: Record<number, { mark: number }> = {};
    (students || []).forEach((s: any, i: number) => {
      const uid = (s && (s.studentId ?? s.id)) ?? i;
      init[Number(uid)] = { mark: Number(s?.mark) || 0 };
    });
    setDraft(init);
  }, [quizId, students]);

  const handleSave = async () => {
    if (!isEditableQuiz || !quizId) return;
    try {
      const studentIds = students.map((s: any) => Number(s.studentId ?? s.id));
      const maxPoints = Number(quiz?.maxPoints) || 0;

      // Step 1: Upload files for students who have new files
      const fileUrls: Record<number, string> = {};

      for (const studentId of studentIds) {
        const file = uploadedFiles[studentId];
        if (file) {
          try {
            const uploadResult = await uploadStudentMarksFile({
              quizId,
              studentId,
              file,
            }).unwrap();
            fileUrls[studentId] = uploadResult.url;
          } catch (error) {
            console.error(
              `Failed to upload file for student ${studentId}:`,
              error
            );
          }
        }
      }

      // Step 2: Prepare marks data with file URLs
      const studentMarks = studentIds
        .filter(
          (sid: number) =>
            draft[sid] !== undefined || uploadedFiles[sid] !== undefined
        )
        .map((sid: number) => {
          const currentFileState = uploadedFiles[sid];
          let finalFileUrl: string | undefined | null = undefined;

          if (currentFileState instanceof File) {
            // New file uploaded
            finalFileUrl = fileUrls[sid];
          } else if (currentFileState === null) {
            // File explicitly removed
            finalFileUrl = null;
          } else {
            // No change to file, preserve existing
            const student = students.find(
              (s: any) => Number(s.studentId ?? s.id) === sid
            );
            finalFileUrl = student?.marksFileUrl;
          }

          // Get mark: use draft if available, otherwise use existing student mark
          let mark = 0;
          if (draft[sid] !== undefined) {
            mark = draft[sid].mark;
          } else {
            const student = students.find(
              (s: any) => Number(s.studentId ?? s.id) === sid
            );
            mark = Number(student?.mark) || 0;
          }

          return {
            userId: sid,
            mark,
            maxPoints: maxPoints, // Use quiz's maxPoints
            marksFileUrl: finalFileUrl,
          };
        });

      console.log("Saving marks payload:", {
        quizId,
        studentMarks,
        draftState: draft,
        uploadedFilesState: uploadedFiles,
      });

      await updateManualMarks({
        quizId,
        studentMarks,
      }).unwrap();

      console.log("Marks saved successfully");

      await refetch(); // Refetch participants after saving
      setIsEditing(false);
      setDraft({}); // Reset draft state
      setUploadedFiles({}); // Reset uploaded files state
    } catch (error) {
      console.error("Failed to save marks:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 w-full h-full overflow-y-auto p-4">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {quiz.title}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${
                    quiz.type === "exam"
                      ? "bg-red-100 text-red-800"
                      : quiz.type === "project"
                      ? "bg-purple-100 text-purple-800"
                      : quiz.type === "lab"
                      ? "bg-blue-100 text-blue-800"
                      : quiz.type === "quiz"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {quiz.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Course:{" "}
                  <span className="font-medium">
                    {selectedQuizDetails.courseName}
                  </span>
                </p>
                <p>
                  Lesson:{" "}
                  <span className="font-medium">
                    {selectedQuizDetails.lessonTitle}
                  </span>
                </p>
                <p>
                  Due Date: <span className="font-medium">{quiz.dueDate}</span>
                </p>
                <p>
                  Max Points:{" "}
                  <span className="font-medium">{quiz.maxPoints}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Quiz Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {(() => {
              const totalStudents = students.length;
              const submittedStudents = students.filter(
                (s: any) => !!s?.submissionDate
              ).length;
              const totalMarks = students.reduce(
                (sum: number, s: any) => sum + (Number(s?.mark) || 0),
                0
              );
              const averageScore =
                totalStudents > 0 ? totalMarks / totalStudents : 0;
              const averagePercentage = quiz?.maxPoints
                ? (averageScore / quiz.maxPoints) * 100
                : 0;
              const highestScore =
                totalStudents > 0
                  ? Math.max(...students.map((s: any) => Number(s?.mark) || 0))
                  : 0;
              const passingStudents = students.filter((s: any) => {
                const mp = Number(quiz?.maxPoints) || 0;
                const mk = Number(s?.mark) || 0;
                return mp > 0 ? (mk / mp) * 100 >= 60 : false;
              }).length;

              return (
                <>
                  <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">
                        {submittedStudents}/{totalStudents}
                      </div>
                    </div>
                    <div className="text-sm text-blue-800">Submissions</div>
                  </div>

                  <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-xl border border-green-200/50 shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">
                        {averagePercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-sm text-green-800">Average Score</div>
                  </div>

                  <div className="bg-yellow-50/80 backdrop-blur-sm p-4 rounded-xl border border-yellow-200/50 shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                      <div className="text-2xl font-bold text-yellow-600">
                        {highestScore}/{quiz.maxPoints}
                      </div>
                    </div>
                    <div className="text-sm text-yellow-800">Highest Score</div>
                  </div>

                  <div className="bg-purple-50/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">
                        {passingStudents}/{students.length}
                      </div>
                    </div>
                    <div className="text-sm text-purple-800">
                      Passing Students
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Student Results Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Student Results
            </h3>
            {isEditableQuiz && (
              <div className="mb-3 flex gap-2 justify-end">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:shadow-blue-500/30 hover:bg-blue-600 transition-all duration-300 border border-blue-500/50 text-sm font-medium"
                  >
                    Edit Marks
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100/80 backdrop-blur-sm text-gray-700 rounded-xl shadow-sm hover:bg-gray-200/80 transition-all duration-300 border border-gray-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:shadow-green-500/30 hover:bg-green-600 transition-all duration-300 border border-green-500/50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
              </div>
            )}
            {/* Responsive Layout: Cards for Mobile, Table for Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/50">
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Percentage
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Letter Grade
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Submission Date
                    </th>
                    {isEditableQuiz && (
                      <th className="px-4 py-3 text-left font-medium text-gray-900">
                        Upload
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(students || [])
                    .sort(
                      (a: any, b: any) =>
                        (Number(b?.mark) || 0) - (Number(a?.mark) || 0)
                    )
                    .map((student: any, index: number) => {
                      const sid = Number(
                        (student && (student.studentId ?? student.id)) ?? index
                      );
                      const mark =
                        isEditing && isEditableQuiz
                          ? Number(draft[sid]?.mark ?? 0)
                          : Number(student?.mark) || 0;
                      const maxPts =
                        Number(
                          (student && student.maxPoints) ?? quiz?.maxPoints
                        ) || 0;
                      const percentage = maxPts > 0 ? (mark / maxPts) * 100 : 0;
                      return (
                        <tr
                          key={sid}
                          className="bg-white/80 backdrop-blur-sm hover:bg-gray-50/80 transition-all duration-300"
                        >
                          <td className="px-4 py-3 font-medium">
                            {student?.name || "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {student?.email || "-"}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {isEditing && isEditableQuiz ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={Number(draft[sid]?.mark ?? 0)}
                                  onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setDraft((prev) => ({
                                      ...prev,
                                      [sid]: { mark: isNaN(v) ? 0 : v },
                                    }));
                                  }}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min={0}
                                  max={maxPts}
                                />
                                <span className="text-sm text-gray-500">
                                  / {maxPts}
                                </span>
                              </div>
                            ) : (
                              <>
                                {mark} / {maxPts}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(
                                percentage
                              )}`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-lg">
                              {getLetterGrade(percentage)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {student?.submissionDate || "Not submitted"}
                          </td>
                          {isEditableQuiz && (
                            <td className="px-4 py-3">
                              <StudentMarksUploader
                                studentName={student?.name || "Student"}
                                existingFileUrl={student?.marksFileUrl}
                                onFileSelect={(file) => {
                                  setUploadedFiles((prev) => ({
                                    ...prev,
                                    [sid]: file,
                                  }));
                                  // Auto-enable edit mode when a file is selected
                                  if (!isEditing) {
                                    setIsEditing(true);
                                    // Initialize draft if not already done
                                    if (
                                      Object.keys(draft).length === 0 &&
                                      students.length > 0
                                    ) {
                                      const init: Record<
                                        number,
                                        { mark: number }
                                      > = {};
                                      (students || []).forEach(
                                        (s: any, i: number) => {
                                          const uid =
                                            (s && (s.studentId ?? s.id)) ?? i;
                                          init[Number(uid)] = {
                                            mark: Number(s?.mark) || 0,
                                          };
                                        }
                                      );
                                      setDraft(init);
                                    }
                                  }
                                }}
                                disabled={false}
                              />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
              {(students || [])
                .sort(
                  (a: any, b: any) =>
                    (Number(b?.mark) || 0) - (Number(a?.mark) || 0)
                )
                .map((student: any, index: number) => {
                  const sid = Number(
                    (student && (student.studentId ?? student.id)) ?? index
                  );
                  const mark =
                    isEditing && isEditableQuiz
                      ? Number(draft[sid]?.mark ?? 0)
                      : Number(student?.mark) || 0;
                  const maxPts =
                    Number((student && student.maxPoints) ?? quiz?.maxPoints) ||
                    0;
                  const percentage = maxPts > 0 ? (mark / maxPts) * 100 : 0;

                  return (
                    <div
                      key={sid}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {student?.name || "-"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {student?.email || "-"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                            percentage
                          )}`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">
                            Score
                          </p>
                          <div className="font-medium mt-1">
                            {isEditing && isEditableQuiz ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={Number(draft[sid]?.mark ?? 0)}
                                  onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setDraft((prev) => ({
                                      ...prev,
                                      [sid]: { mark: isNaN(v) ? 0 : v },
                                    }));
                                  }}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min={0}
                                  max={maxPts}
                                />
                                <span className="text-sm text-gray-500">
                                  / {maxPts}
                                </span>
                              </div>
                            ) : (
                              <>
                                {mark} / {maxPts}
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">
                            Grade
                          </p>
                          <p className="font-bold text-lg mt-1">
                            {getLetterGrade(percentage)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {student?.submissionDate || "Not submitted"}
                        </span>
                        {isEditableQuiz && (
                          <StudentMarksUploader
                            studentName={student?.name || "Student"}
                            existingFileUrl={student?.marksFileUrl}
                            onFileSelect={(file) => {
                              setUploadedFiles((prev) => ({
                                ...prev,
                                [sid]: file,
                              }));
                              // Auto-enable edit mode when a file is selected
                              if (!isEditing) {
                                setIsEditing(true);
                                // Initialize draft if not already done
                                if (
                                  Object.keys(draft).length === 0 &&
                                  students.length > 0
                                ) {
                                  const init: Record<number, { mark: number }> =
                                    {};
                                  (students || []).forEach(
                                    (s: any, i: number) => {
                                      const uid =
                                        (s && (s.studentId ?? s.id)) ?? i;
                                      init[Number(uid)] = {
                                        mark: Number(s?.mark) || 0,
                                      };
                                    }
                                  );
                                  setDraft(init);
                                }
                              }
                            }}
                            disabled={false}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsView;
