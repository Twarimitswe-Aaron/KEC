import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, Save, Plus } from 'lucide-react';
import { 
  useCreateManualQuizMutation, 
  useUpdateManualMarksMutation, 
  type CreateManualQuizRequest,
  type EnrolledStudent 
} from '../../state/api/quizApi';

interface QuizCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  lessonId: number;
  courseName: string;
  lessonTitle: string;
  enrolledStudents: EnrolledStudent[];
  onQuizCreated?: () => void;
}

interface StudentMark {
  userId: number;
  name: string;
  email: string;
  mark: number;
  maxPoints: number;
}

const QuizCreationModal: React.FC<QuizCreationModalProps> = ({
  isOpen,
  onClose,
  courseId,
  lessonId,
  courseName,
  lessonTitle,
  enrolledStudents,
  onQuizCreated
}) => {
  const [step, setStep] = useState<'create' | 'marks'>('create');
  const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);
  
  // Quiz creation form state
  const [quizData, setQuizData] = useState<CreateManualQuizRequest>({
    name: '',
    description: '',
    courseId,
    lessonId,
    maxPoints: 100,
    type: 'assignment'
  });

  // Student marks state
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);

  // API hooks
  const [createManualQuiz, { isLoading: isCreating }] = useCreateManualQuizMutation();
  const [updateManualMarks, { isLoading: isUpdatingMarks }] = useUpdateManualMarksMutation();
  
  // Initialize student marks when enrolledStudents change
  useEffect(() => {
    if (enrolledStudents.length > 0) {
      setStudentMarks(
        enrolledStudents.map(student => ({
          userId: student.id,
          name: student.name,
          email: student.email,
          mark: 0,
          maxPoints: quizData.maxPoints
        }))
      );
    }
  }, [enrolledStudents, quizData.maxPoints]);

  // Update maxPoints for all students when quiz maxPoints changes
  useEffect(() => {
    setStudentMarks(prev => 
      prev.map(student => ({
        ...student,
        maxPoints: quizData.maxPoints
      }))
    );
  }, [quizData.maxPoints]);

  const handleCreateQuiz = async () => {
    try {
      const result = await createManualQuiz(quizData).unwrap();
      setCreatedQuizId(result.quiz.id);
      setStep('marks');
    } catch (error) {
      console.error('Failed to create quiz:', error);
    }
  };

  const handleUpdateStudentMark = (userId: number, mark: number) => {
    setStudentMarks(prev =>
      prev.map(student =>
        student.userId === userId 
          ? { ...student, mark: Math.max(0, Math.min(mark, student.maxPoints)) }
          : student
      )
    );
  };

  const handleSaveMarks = async () => {
    if (!createdQuizId) return;

    try {
      await updateManualMarks({
        quizId: createdQuizId,
        studentMarks: studentMarks.map(student => ({
          userId: student.userId,
          mark: student.mark,
          maxPoints: student.maxPoints
        }))
      }).unwrap();

      // Success feedback and close
      onQuizCreated?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save marks:', error);
    }
  };

  const handleClose = () => {
    setStep('create');
    setCreatedQuizId(null);
    setQuizData({
      name: '',
      description: '',
      courseId,
      lessonId,
      maxPoints: 100,
      type: 'assignment'
    });
    setStudentMarks([]);
    onClose();
  };

  const calculateStats = () => {
    const totalMarks = studentMarks.reduce((sum, student) => sum + student.mark, 0);
    const average = studentMarks.length > 0 ? totalMarks / studentMarks.length : 0;
    const maxMark = Math.max(...studentMarks.map(s => s.mark), 0);
    const minMark = Math.min(...studentMarks.map(s => s.mark), 0);
    const passingStudents = studentMarks.filter(s => (s.mark / s.maxPoints) * 100 >= 65).length;

    return { average, maxMark, minMark, passingStudents };
  };

  if (!isOpen) return null;

  const stats = calculateStats();

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {step === 'create' ? 'Create New Quiz' : 'Set Student Marks'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {courseName} - {lessonTitle}
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'create' ? (
            // Step 1: Create Quiz
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizData.name}
                    onChange={(e) => setQuizData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quiz title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Type *
                  </label>
                  <select
                    value={quizData.type}
                    onChange={(e) => setQuizData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="practice">Practice</option>
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="lab">Lab</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Points *
                  </label>
                  <input
                    type="number"
                    value={quizData.maxPoints}
                    onChange={(e) => setQuizData(prev => ({ ...prev, maxPoints: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="1000"
                    required
                  />
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {enrolledStudents.length} Students
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {quizData.type}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter quiz description (optional)"
                />
              </div>

              {/* Enrolled Students Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Enrolled Students ({enrolledStudents.length})
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {enrolledStudents.map(student => (
                      <div key={student.id} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{student.name}</span>
                        <span className="text-gray-500 text-xs">({student.email})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateQuiz}
                  disabled={!quizData.name.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Create Quiz & Set Marks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Set Student Marks
            <div className="space-y-6">
              {/* Quiz Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-blue-900">{quizData.name}</h3>
                    <p className="text-blue-700 text-sm">{quizData.type} • {quizData.maxPoints} points</p>
                    {quizData.description && (
                      <p className="text-blue-600 text-sm mt-1">{quizData.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600">Quiz Created Successfully!</div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-green-600">Average</div>
                  <div className="text-lg font-bold text-green-900">
                    {stats.average.toFixed(1)}/{quizData.maxPoints}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-600">Highest</div>
                  <div className="text-lg font-bold text-blue-900">
                    {stats.maxMark}/{quizData.maxPoints}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-sm text-orange-600">Lowest</div>
                  <div className="text-lg font-bold text-orange-900">
                    {stats.minMark}/{quizData.maxPoints}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm text-purple-600">Passing</div>
                  <div className="text-lg font-bold text-purple-900">
                    {stats.passingStudents}/{studentMarks.length}
                  </div>
                </div>
              </div>

              {/* Student Marks Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h4 className="font-medium text-gray-900">Student Marks</h4>
                  <p className="text-sm text-gray-600">Enter marks for each student (0 to {quizData.maxPoints})</p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-900">Student</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-900">Email</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-900">Mark</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-900">Percentage</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-900">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentMarks.map((student, index) => {
                        const percentage = (student.mark / student.maxPoints) * 100;
                        const letterGrade = percentage >= 97 ? 'A+' :
                                          percentage >= 93 ? 'A' :
                                          percentage >= 90 ? 'A-' :
                                          percentage >= 87 ? 'B+' :
                                          percentage >= 83 ? 'B' :
                                          percentage >= 80 ? 'B-' :
                                          percentage >= 77 ? 'C+' :
                                          percentage >= 73 ? 'C' :
                                          percentage >= 70 ? 'C-' :
                                          percentage >= 67 ? 'D+' :
                                          percentage >= 65 ? 'D' : 'F';
                        
                        return (
                          <tr key={student.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 font-medium">{student.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  value={student.mark}
                                  onChange={(e) => handleUpdateStudentMark(student.userId, Number(e.target.value))}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  max={student.maxPoints}
                                />
                                <span className="text-sm text-gray-500">/ {student.maxPoints}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                percentage >= 90 ? 'bg-green-100 text-green-800' :
                                percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                                percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                percentage >= 60 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium">{letterGrade}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setStep('create')}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  ← Back to Quiz Details
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMarks}
                    disabled={isUpdatingMarks}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
                  >
                    {isUpdatingMarks ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Marks & Complete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCreationModal;
