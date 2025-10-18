import React, { useState, useMemo } from "react";
import { Search, Download, Plus, Edit2, Trash2, Filter, BarChart3, Users, BookOpen, TrendingUp, X } from "lucide-react";
import { FaUser } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Expanded mock data with more realistic structure
const initialMockData = [
  {
    id: 1,
    name: "Mechanical Engineering 101",
    code: "ME101",
    semester: "Fall 2024",
    credits: 3,
    instructor: "Dr. Smith",
    assignments: [
      {
        id: 101,
        title: "Thermodynamics Assignment",
        type: "assignment",
        dueDate: "2024-10-15",
        maxPoints: 100,
        weight: 0.2,
        students: [
          { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 82, submissionDate: "2024-10-14" },
          { id: 2, name: "Bob Wilson", email: "bob@university.edu", mark: 91, submissionDate: "2024-10-13" },
          { id: 3, name: "Charlie Brown", email: "charlie@university.edu", mark: 76, submissionDate: "2024-10-15" },
          { id: 4, name: "Diana Prince", email: "diana@university.edu", mark: 88, submissionDate: "2024-10-14" },
        ],
      },
      {
        id: 102,
        title: "Fluid Mechanics Lab Report",
        type: "lab",
        dueDate: "2024-10-25",
        maxPoints: 100,
        weight: 0.15,
        students: [
          { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 88, submissionDate: "2024-10-24" },
          { id: 2, name: "Bob Wilson", email: "bob@university.edu", mark: 79, submissionDate: "2024-10-25" },
          { id: 3, name: "Charlie Brown", email: "charlie@university.edu", mark: 92, submissionDate: "2024-10-23" },
          { id: 4, name: "Diana Prince", email: "diana@university.edu", mark: 85, submissionDate: "2024-10-24" },
        ],
      },
      {
        id: 103,
        title: "Midterm Exam",
        type: "exam",
        dueDate: "2024-11-05",
        maxPoints: 150,
        weight: 0.3,
        students: [
          { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 128, submissionDate: "2024-11-05" },
          { id: 2, name: "Bob Wilson", email: "bob@university.edu", mark: 142, submissionDate: "2024-11-05" },
          { id: 3, name: "Charlie Brown", email: "charlie@university.edu", mark: 115, submissionDate: "2024-11-05" },
          { id: 4, name: "Diana Prince", email: "diana@university.edu", mark: 135, submissionDate: "2024-11-05" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Mechanical Engineering 202",
    code: "ME202",
    semester: "Fall 2024",
    credits: 4,
    instructor: "Prof. Johnson",
    assignments: [
      {
        id: 201,
        title: "Machine Design Project",
        type: "project",
        dueDate: "2024-11-15",
        maxPoints: 200,
        weight: 0.4,
        students: [
          { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 188, submissionDate: "2024-11-14" },
          { id: 5, name: "David Chen", email: "david@university.edu", mark: 172, submissionDate: "2024-11-15" },
          { id: 6, name: "Eve Martinez", email: "eve@university.edu", mark: 160, submissionDate: "2024-11-13" },
          { id: 7, name: "Frank Davis", email: "frank@university.edu", mark: 195, submissionDate: "2024-11-14" },
        ],
      },
      {
        id: 202,
        title: "Material Science Test",
        type: "quiz",
        dueDate: "2024-10-30",
        maxPoints: 50,
        weight: 0.15,
        students: [
          { id: 5, name: "David Chen", email: "david@university.edu", mark: 39, submissionDate: "2024-10-30" },
          { id: 6, name: "Eve Martinez", email: "eve@university.edu", mark: 42, submissionDate: "2024-10-30" },
          { id: 7, name: "Frank Davis", email: "frank@university.edu", mark: 45, submissionDate: "2024-10-30" },
          { id: 8, name: "Grace Lee", email: "grace@university.edu", mark: 47, submissionDate: "2024-10-30" },
        ],
      },
    ],
  },
];

const Tasks = () => {
  // State management
  const [data, setData] = useState(initialMockData);
  const [expandedCourses, setExpandedCourses] = useState<number[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<Record<number, number | "total" | "analytics" | null>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    type: "assignment",
    dueDate: "",
    maxPoints: 100,
    weight: 0.1,
  });

  // Calculate weighted total marks per student across all assignments
  const calculateWeightedTotalMarks = (assignments: any[]) => {
    const totals: Record<number, { name: string; email: string; mark: number; maxPossible: number; percentage: number }> = {};
    
    assignments.forEach((assignment) => {
      assignment.students.forEach((student: any) => {
        if (!totals[student.id]) {
          totals[student.id] = { 
            name: student.name, 
            email: student.email,
            mark: 0, 
            maxPossible: 0,
            percentage: 0
          };
        }
        const weightedMark = (student.mark / assignment.maxPoints) * assignment.weight * 100;
        totals[student.id].mark += weightedMark;
        totals[student.id].maxPossible += assignment.weight * 100;
      });
    });

    // Calculate percentages
    Object.values(totals).forEach(student => {
      student.percentage = student.maxPossible > 0 ? (student.mark / student.maxPossible) * 100 : 0;
    });

    return Object.values(totals);
  };

  // Calculate course analytics
  const calculateAnalytics = (assignments: any[]) => {
    const totalStudents = new Set();
    let totalSubmissions = 0;
    let totalPossiblePoints = 0;
    let totalEarnedPoints = 0;
    const assignmentStats: Array<{
      title: string;
      average: string;
      max: number;
      min: number;
      submissions: number;
      type: string;
    }> = [];

    assignments.forEach(assignment => {
      assignment.students.forEach((student: any) => {
        totalStudents.add(student.id);
        totalSubmissions++;
        totalPossiblePoints += assignment.maxPoints;
        totalEarnedPoints += student.mark;
      });

      const marks = assignment.students.map((s: any) => s.mark);
      const avg = marks.reduce((a:number, b:number) => a + b, 0) / marks.length;
      const max = Math.max(...marks);
      const min = Math.min(...marks);

      assignmentStats.push({
        title: assignment.title,
        average: avg.toFixed(1),
        max,
        min,
        submissions: assignment.students.length,
        type: assignment.type
      });
    });

    return {
      totalStudents: totalStudents.size,
      totalSubmissions,
      averageScore: totalPossiblePoints > 0 ? ((totalEarnedPoints / totalPossiblePoints) * 100).toFixed(1) : 0,
      assignmentStats
    };
  };

  // Filter and sort functionality
  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'credits':
          aValue = a.credits;
          bValue = b.credits;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [searchTerm, sortBy, sortOrder, data]);

  // Toggle course expand/collapse
  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Export functionality
  const exportToExcel = (courseId: number) => {
    const course = data.find(c => c.id === courseId);
    const selected = selectedAssignments[courseId];
  
    if (!course) return;
  
    let worksheetData: any[] = [];
  
    if (selected === "total") {
      const totalMarks = calculateWeightedTotalMarks(course.assignments);
  
      worksheetData = totalMarks.map(student => ({
        "Student Name": student.name,
        "Email": student.email,
        "Total Score": student.mark.toFixed(2),
        "Percentage": `${student.percentage.toFixed(2)}%`
      }));
    } else if (typeof selected === "number") {
      const assignment = course.assignments.find(a => a.id === selected);
      if (assignment) {
        worksheetData = assignment.students.map(student => ({
          "Student Name": student.name,
          "Email": student.email,
          "Mark": student.mark,
          "Submission Date": student.submissionDate
        }));
      }
    }
  
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");
  
    // Convert workbook to binary array
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
    // Save the file
    const fileName = `${course.code}_${selected}_grades.xlsx`;
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), fileName);
  };

  // Add new assignment to a course
  const addAssignmentToCourse = (courseId: number) => {
    if (!newAssignment.title || !newAssignment.dueDate) return;
    
    const course = data.find(c => c.id === courseId);
    if (!course) return;
    
    // Get all student IDs enrolled in this course
    const enrolledStudentIds = new Set();
    course.assignments.forEach(assignment => {
      assignment.students.forEach(student => {
        enrolledStudentIds.add(student.id);
      });
    });
    
    // Create student entries for the new assignment
    const students = Array.from(enrolledStudentIds).map(id => {
      // Find student details from existing assignments
      const existingStudent = course.assignments[0]?.students.find((s: any) => s.id === id);
      return {
        id: id as number,
        name: existingStudent?.name || `Student ${id}`,
        email: existingStudent?.email || `student${id}@university.edu`,
        mark: 0, // Default to 0 (not submitted)
        submissionDate: "" // Empty until submitted
      };
    });
    
    // Create the new assignment
    const assignment = {
      id: Math.max(...course.assignments.map((a: any) => a.id), 0) + 1,
      ...newAssignment,
      students
    };
    
    // Update the data
    setData(prev => prev.map(course => 
      course.id === courseId 
        ? {...course, assignments: [...course.assignments, assignment]}
        : course
    ));
    
    // Reset form and close modal
    setNewAssignment({
      title: "",
      type: "assignment",
      dueDate: "",
      maxPoints: 100,
      weight: 0.1,
    });
    setIsAddAssignmentModalOpen(false);
  };

  // Update student marks for an assignment
  const updateStudentMark = (courseId: number, assignmentId: number, studentId: number, mark: number) => {
    setData(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      
      return {
        ...course,
        assignments: course.assignments.map(assignment => {
          if (assignment.id !== assignmentId) return assignment;
          
          return {
            ...assignment,
            students: assignment.students.map(student => {
              if (student.id !== studentId) return student;
              
              return {
                ...student,
                mark: Math.min(mark, assignment.maxPoints), // Ensure mark doesn't exceed max points
                submissionDate: mark > 0 ? new Date().toISOString().split('T')[0] : student.submissionDate
              };
            })
          };
        })
      };
    }));
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-50";
    if (percentage >= 80) return "text-blue-600 bg-blue-50";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50";
    if (percentage >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 65) return "D";
    return "F";
  };

  // Render the Add Assignment Modal
  const renderAddAssignmentModal = () => {
    if (!isAddAssignmentModalOpen || !currentCourse) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Add New Assignment to {currentCourse.name}</h3>
            <button 
              onClick={() => setIsAddAssignmentModalOpen(false)}
              className="text-gray-500 cursor-pointer hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                className="w-full px-3 py-2 border outline-none border-gray-300 rounded-md"
                placeholder="Enter assignment title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newAssignment.type}
                onChange={(e) => setNewAssignment({...newAssignment, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                
               
                
                <option value="practice">Practice</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                className="w-full px-3 py-2 border outline-none border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Points
              </label>
              <input
                type="number"
                value={newAssignment.maxPoints}
                onChange={(e) => setNewAssignment({...newAssignment, maxPoints: Number(e.target.value)})}
                className="w-full px-3 py-2 border outline-none border-gray-300 rounded-md"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (% of total grade)
              </label>
              <input
                type="number"
                value={newAssignment.weight * 100}
                onChange={(e) => setNewAssignment({
                  ...newAssignment, 
                  weight: Math.min(Number(e.target.value) / 100, 1)
                })}
                className="w-full px-3 py-2 outline-none border border-gray-300 rounded-md"
                min="1"
                max="100"
              />
            </div>
            
            <button
              onClick={() => addAssignmentToCourse(currentCourse.id)}
              disabled={!newAssignment.title || !newAssignment.dueDate}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Add Assignment
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=" mx-auto bg-gray-50 min-h-screen ">
      

     

      {/* Course Cards */}
      {filteredData.map((course) => {
        const isExpanded = expandedCourses.includes(course.id);
        const selected = selectedAssignments[course.id] ?? null;
        const assignment = selected && typeof selected === 'number' 
          ? course.assignments.find((a: any) => a.id === selected) 
          : null;

        const totalMarks = selected === "total" ? calculateWeightedTotalMarks(course.assignments) : null;
        const analytics = selected === "analytics" ? calculateAnalytics(course.assignments) : null;

        return (
          <div key={course.id} className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            {/* Course Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{course.name}</h2>
                
                  <div className="flex gap-3 text-gray-500 items-center">
                    <FaUser/>
                    <span className="font-medium">{course.instructor}</span>
                   
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setCurrentCourse(course);
                      setIsAddAssignmentModalOpen(true);
                    }}
                    className="px-3 py-1  cursor-pointer bg-[#034153] text-white rounded-md text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 text-white w-4" />
                    
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    {course.assignments.length} assignments
                  </span>
                  <button 
                    onClick={() => toggleCourse(course.id)}
                    className="text-[#034153] transition-colors"
                  >
                    {isExpanded ? "▲ Collapse" : "▼ Expand"}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-6">
                {/* Assignment Selection */}
                <div className="flex items-baseline flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Assignment or View
                    </label>
                    <select
                      className="w-full rounded-md outline-none px-3 py-2 border border-slate-400"
                      value={selected ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedAssignments((prev) => ({
                          ...prev,
                          [course.id]: value === "total" ? "total" : 
                                     value === "analytics" ? "analytics" :
                                     value === "" ? null : Number(value),
                        }));
                      }}
                    >
                      <option className="cursor-pointer" value="">-- Choose Option --</option>
                      <optgroup label="Assignments">
                        {course.assignments.map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {a.title} ({a.type})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Views">
                        <option value="total">Final Grades</option>
                        <option value="analytics">Course Analytics</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  {selected && (
                    <div className="flex h-10 gap-2">
                      <button
                        onClick={() => exportToExcel(course.id)}
                        className="px-2 py-0 bg-green-600 cursor-pointer text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Excel
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Based on Selection */}
                {assignment && (
                  <div className="space-y-4">
                    {/* Assignment Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <div className="font-medium capitalize">{assignment.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Due Date:</span>
                          <div className="font-medium">{assignment.dueDate}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Max Points:</span>
                          <div className="font-medium">{assignment.maxPoints}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <div className="font-medium">{(assignment.weight * 100)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Student</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Email</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Score</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Percentage</th>

                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignment.students.map((student: any, index: number) => {
                            const percentage = (student.mark / assignment.maxPoints) * 100;
                            return (
                              <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="border-b px-4 py-3 font-medium">{student.name}</td>
                                <td className="border-b px-4 py-3 text-gray-600 text-sm">{student.email}</td>
                                <td className="border-b px-4 py-3">
                                  <input
                                    type="number"
                                    value={student.mark}
                                    onChange={(e) => updateStudentMark(
                                      course.id, 
                                      assignment.id, 
                                      student.id, 
                                      Number(e.target.value)
                                    )}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                                    min="0"
                                    max={assignment.maxPoints}
                                  />
                                  <span className="text-gray-500"></span>
                                </td>
                                <td className="border-b px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(percentage)}`}>
                                    {percentage.toFixed(1)}%
                                  </span>
                                </td>
                               
                                <td className="border-b px-4 py-3 text-sm text-gray-600">{student.submissionDate || "Not submitted"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {totalMarks && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-lg font-bold text-blue-900 mb-2">Final Course Grades</h4>
                      <p className="text-blue-700 text-sm">
                        Calculated using weighted averages across all assignments
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Student</th>
                            <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Email</th>
                            <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Total Score</th>
                            <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Percentage</th>
                            <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Letter Grade</th>
                            <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {totalMarks
                            .sort((a, b) => b.percentage - a.percentage)
                            .map((student, index) => (
                              <tr key={student.name} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="border-b border-gray-400 px-4 py-3 font-medium">{student.name}</td>
                                <td className="border-b border-gray-400 px-4 py-3 text-gray-600 text-sm">{student.email}</td>
                                <td className="border-b border-gray-400 px-4 py-3 font-medium">{student.mark.toFixed(2)}</td>
                                <td className="border-b border-gray-400 px-4 py-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(student.percentage)}`}>
                                    {student.percentage.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="border-b border-gray-400 px-4 py-3">
                                  <span className="font-bold text-xl">{getLetterGrade(student.percentage)}</span>
                                </td>
                                <td className="border-b border-gray-400 px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    student.percentage >= 65 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {student.percentage >= 65 ? "Passing" : "At Risk"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {analytics && (
                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-lg font-bold text-purple-900 mb-2">Course Analytics Dashboard</h4>
                      <p className="text-purple-700 text-sm">
                        Comprehensive statistics and performance metrics
                      </p>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border-slate-200 border">
                        <div className="text-2xl font-bold text-blue-600">{analytics.totalStudents}</div>
                        <div className="text-sm text-gray-600">Enrolled Students</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border-slate-200 border">
                        <div className="text-2xl font-bold text-green-600">{analytics.totalSubmissions}</div>
                        <div className="text-sm text-gray-600">Total Submissions</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border-slate-200 border">
                        <div className="text-2xl font-bold text-orange-600">{analytics.averageScore}%</div>
                        <div className="text-sm text-gray-600">Course Average</div>
                      </div>
                    </div>

                    {/* Assignment Breakdown */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-400">
                        <h5 className="font-medium text-gray-900">Assignment Performance Breakdown</h5>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Assignment</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Average</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Highest</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Lowest</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Submissions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.assignmentStats.map((stat, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-2 font-medium">{stat.title}</td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    stat.type === 'exam' ? 'bg-red-100 text-red-800' :
                                    stat.type === 'project' ? 'bg-purple-100 text-purple-800' :
                                    stat.type === 'lab' ? 'bg-blue-100 text-blue-800' :
                                    stat.type === 'quiz' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {stat.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2 font-semibold text-blue-600">{stat.average}</td>
                                <td className="px-4 py-2 text-green-600 font-medium">{stat.max}</td>
                                <td className="px-4 py-2 text-red-600 font-medium">{stat.min}</td>
                                <td className="px-4 py-2">{stat.submissions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="border-slate-200 rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900 mb-3"> Quick Insights</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/50 rounded border-slate-200 border p-3">
                          <div className="font-medium text-blue-800">Best Performing Assignment</div>
                          <div className="text-blue-600">{analytics.assignmentStats.reduce((best, current) => 
                            parseFloat(current.average) > parseFloat(best.average) ? current : best
                          ).title}</div>
                        </div>
                        <div className="bg-white/50 rounded p-3">
                          <div className="font-medium text-purple-800">Most Challenging</div>
                          <div className="text-purple-600">{analytics.assignmentStats.reduce((worst, current) => 
                            parseFloat(current.average) < parseFloat(worst.average) ? current : worst
                          ).title}</div>
                        </div>
                        <div className="bg-white/50 rounded border-slate-200 border md:border-0 p-3">
                          <div className="font-medium  text-green-800">Completion Rate</div>
                          <div className="text-green-600">98.5%</div>
                        </div>
                        <div className="bg-white/50 rounded border-slate-200 md:border p-3">
                          <div className="font-medium text-orange-800">Students at Risk</div>
                          <div className="text-orange-600">2 students</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selected && (
                  <div className="text-center justify-center flex flex-col py-12">
                    <div className="text-6xl mb-4 text-gray-400 mx-auto"><MdAssignmentAdd /></div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Assignment or View</h3>
                    <p className="text-gray-600">Choose from the dropdown above to view detailed information</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {filteredData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4"><FaSearch /></div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-6 right-6 space-y-2">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => {
            // Optionally set a default course for the FAB
            if (filteredData.length > 0) {
              setCurrentCourse(filteredData[0]);
              setIsAddAssignmentModalOpen(true);
            }
          }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
      
      {renderAddAssignmentModal()}
    </div>
  );
};

export default Tasks;