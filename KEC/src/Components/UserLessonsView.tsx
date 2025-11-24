import React, { useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCourseForStudentQuery,
  useGetCourseDataQuery,
} from "../state/api/courseApi";
import { BookOpen } from "lucide-react";
import { UserRoleContext } from "../UserRoleContext";

const UserLessonsView = () => {
  const { id } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();
  const userRole = useContext(UserRoleContext);

  // Use different queries based on role
  const isPrivileged = userRole === "admin" || userRole === "teacher";

  const {
    data: studentData,
    isLoading: isLoadingStudent,
    error: errorStudent,
  } = useGetCourseForStudentQuery(courseId, {
    skip: !courseId || isPrivileged,
  });

  const {
    data: privilegedData,
    isLoading: isLoadingPrivileged,
    error: errorPrivileged,
  } = useGetCourseDataQuery(courseId, {
    skip: !courseId || !isPrivileged,
  });

  const data = isPrivileged ? privilegedData : studentData;
  const isLoading = isPrivileged ? isLoadingPrivileged : isLoadingStudent;
  const error = isPrivileged ? errorPrivileged : errorStudent;

  const lessons = useMemo(() => data?.lesson || [], [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse text-gray-500">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-red-500">Failed to load course</div>
      </div>
    );
  }

  return (
    <div className="">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="my-4">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
              {data?.title || "Course Lessons"}
            </h1>
            <p className="text-md text-gray-600 mt-2 max-w-2xl">
              Access your unlocked lessons and resources. Quizzes will be graded
              automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {lessons.map((lesson: any) => (
          <div
            key={lesson.id}
            className="bg-white rounded-xl shadow p-5 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 text-green-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {lesson.title}
                </h3>
                <p className="text-gray-600 text-sm">{lesson.description}</p>
              </div>
            </div>

            {(lesson.resources || []).length > 0 && (
              <div className="mt-3 space-y-2">
                {lesson.resources.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="text-sm text-gray-800">
                      <div className="font-semibold">{r.name || r.title}</div>
                      <div className="text-xs text-gray-500">{r.type}</div>
                    </div>
                    <div>
                      {r.type === "quiz" && r.form?.quizzes?.length > 0 ? (
                        r.form.quizzes.map((q: any) => (
                          <button
                            key={q.id}
                            onClick={() =>
                              navigate(
                                `/dashboard/course/${courseId}/quiz/${q.id}?lessonId=${lesson.id}&formId=${r.form.id}`
                              )
                            }
                            className="px-4 py-2 bg-[#034153] text-white rounded-md text-sm cursor-pointer"
                          >
                            Take Quiz
                          </button>
                        ))
                      ) : r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No action</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserLessonsView;
