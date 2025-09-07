import React, { useState } from "react";
import { FaDownload, FaPrint, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

type Student = {
  id: number;
  name: string;
  email: string;
  score: number;
  total: number;
  percentage: number;
  status: string;
  submittedAt: string;
};

type Course = {
  courseId: number;
  courseName: string;
  students: Student[];
  averageScore: number;
  submissionRate: number;
};

type Props = {
  results: Course[];
};

type SortConfig = {
  key: keyof Student;
  direction: 'ascending' | 'descending';
};

const CourseResults: React.FC<Props> = ({ results }) => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'cards'>('table');

  const course = results.find((c) => c.courseId === selectedCourse);

  // Sort students based on sort configuration
  const sortedStudents = React.useMemo(() => {
    if (!course || !sortConfig) return course?.students || [];
    
    return [...course.students].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [course, sortConfig]);

  const requestSort = (key: keyof Student) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Student) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <FaSortUp className="ml-1" /> 
      : <FaSortDown className="ml-1" />;
  };

  const exportToCSV = () => {
    if (!course) return;
    
    const headers = ['Student Name', 'Email', 'Score', 'Total', 'Percentage', 'Status', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...course.students.map(student => 
        `"${student.name}","${student.email}",${student.score},${student.total},${student.percentage}%,${student.status},"${student.submittedAt}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${course.courseName.replace(/\s+/g, '_')}_Results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printResults = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Course Results</h1>
          
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={!course}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <FaDownload size={14} /> Export CSV
            </button>
            <button
              onClick={printResults}
              disabled={!course}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <FaPrint size={14} /> Print
            </button>
          </div>
        </div>

        {/* Course Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Select Course</h2>
          <div className="flex gap-3 flex-wrap">
            {results.map((c) => (
              <button
                key={c.courseId}
                onClick={() => setSelectedCourse(c.courseId)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCourse === c.courseId
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {c.courseName}
              </button>
            ))}
          </div>
        </div>

        {/* Course Statistics */}
        {course && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Average Score</h3>
              <p className="text-2xl font-bold text-blue-600">{course.averageScore}%</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Submission Rate</h3>
              <p className="text-2xl font-bold text-green-600">{course.submissionRate}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800">Total Students</h3>
              <p className="text-2xl font-bold text-purple-600">{course.students.length}</p>
            </div>
          </div>
        )}

        {/* View Toggle */}
        {course && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveView('table')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'table' 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setActiveView('cards')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'cards' 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Card View
            </button>
          </div>
        )}

        {/* Students Display */}
        {course ? (
          activeView === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        Student Name
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('score')}
                    >
                      <div className="flex items-center">
                        Score
                        {getSortIcon('score')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('percentage')}
                    >
                      <div className="flex items-center">
                        Percentage
                        {getSortIcon('percentage')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          student.percentage >= 80 ? 'text-green-600' : 
                          student.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.status === 'Submitted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedStudents.map((student) => (
                <div key={student.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">{student.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{student.email}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Score</p>
                      <p className="font-medium">{student.score}/{student.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Percentage</p>
                      <p className={`font-medium ${
                        student.percentage >= 80 ? 'text-green-600' : 
                        student.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {student.percentage}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'Submitted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status}
                    </span>
                    {student.submittedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(student.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Course Selected</h3>
            <p className="text-gray-500">Please select a course to view student results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseResults;