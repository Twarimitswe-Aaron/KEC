import React from "react";
import { 
  ArrowLeft,
  Users, 
  BarChart3, 
  TrendingUp
} from "lucide-react";

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
  getLetterGrade
}) => {
  if (!selectedQuizDetails) {
    return null;
  }

  const { quiz } = selectedQuizDetails;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
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
                <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${
                  quiz.type === 'exam' ? 'bg-red-100 text-red-800' :
                  quiz.type === 'project' ? 'bg-purple-100 text-purple-800' :
                  quiz.type === 'lab' ? 'bg-blue-100 text-blue-800' :
                  quiz.type === 'quiz' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {quiz.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Course: <span className="font-medium">{selectedQuizDetails.courseName}</span></p>
                <p>Lesson: <span className="font-medium">{selectedQuizDetails.lessonTitle}</span></p>
                <p>Due Date: <span className="font-medium">{quiz.dueDate}</span></p>
                <p>Max Points: <span className="font-medium">{quiz.maxPoints}</span></p>
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
              const students = quiz.students || [];
              const totalStudents = students.length;
              const submittedStudents = students.filter((s: any) => s.submissionDate).length;
              const averageScore = totalStudents > 0 ? 
                students.reduce((sum: number, s: any) => sum + s.mark, 0) / totalStudents : 0;
              const averagePercentage = (averageScore / quiz.maxPoints) * 100;
              const highestScore = Math.max(...students.map((s: any) => s.mark));
              const lowestScore = Math.min(...students.map((s: any) => s.mark));
              const passingStudents = students.filter((s: any) => (s.mark / quiz.maxPoints) * 100 >= 60).length;

              return (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">{submittedStudents}/{totalStudents}</div>
                    </div>
                    <div className="text-sm text-blue-800">Submissions</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">{averagePercentage.toFixed(1)}%</div>
                    </div>
                    <div className="text-sm text-green-800">Average Score</div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                      <div className="text-2xl font-bold text-yellow-600">{highestScore}/{quiz.maxPoints}</div>
                    </div>
                    <div className="text-sm text-yellow-800">Highest Score</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">{passingStudents}/{students.length}</div>
                    </div>
                    <div className="text-sm text-purple-800">Passing Students</div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Student Results Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Student Name</th>
                    <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Email</th>
                    <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Score</th>
                    <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Percentage</th>
                    <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Letter Grade</th>
                    <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quiz.students && quiz.students
                    .sort((a: any, b: any) => b.mark - a.mark)
                    .map((student: any, index: number) => {
                      const percentage = (student.mark / quiz.maxPoints) * 100;
                      return (
                        <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border-b px-4 py-3 font-medium">{student.name}</td>
                          <td className="border-b px-4 py-3 text-gray-600 text-sm">{student.email}</td>
                          <td className="border-b px-4 py-3 font-medium">
                            {student.mark} / {quiz.maxPoints}
                          </td>
                          <td className="border-b px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(percentage)}`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="border-b px-4 py-3">
                            <span className="font-bold text-lg">{getLetterGrade(percentage)}</span>
                          </td>
                          <td className="border-b px-4 py-3 text-sm text-gray-600">
                            {student.submissionDate || "Not submitted"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsView;
