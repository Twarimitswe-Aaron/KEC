import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  X,
  Users,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  BookOpen,
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  paid: boolean;
  course: string;
  location: string;
};

type Course = {
  id: number;
  title: string;
  students: Student[];
  image?: string;
};

const StudentsRequest: React.FC = () => {
  const mockCourses: Course[] = [
    {
      id: 1,
      title: "Thermodynamics Basics",
      image:
        "https://i.pinimg.com/736x/41/05/64/41056405ae252836c286d6eca5983724.jpg",
      students: [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice@example.com",
          phone: "555-1234",
          paid: true,
          course: "Thermodynamics Basics",
          location: "New York, USA",
        },
        {
          id: 2,
          name: "Bob Smith",
          email: "bob@example.com",
          phone: "555-5678",
          paid: false,
          course: "Thermodynamics Basics",
          location: "London, UK",
        },
        {
          id: 4,
          name: "Diana Ross",
          email: "diana@example.com",
          phone: "555-9999",
          paid: true,
          course: "Thermodynamics Basics",
          location: "Paris, France",
        },
      ],
    },
    {
      id: 2,
      title: "Advanced Fluid Mechanics",
      image:
        "https://i.pinimg.com/736x/4d/19/90/4d19904f4cb65c410e37863eb9f0dc0a.jpg",
      students: [
        {
          id: 3,
          name: "Charlie Brown",
          email: "charlie@example.com",
          phone: "555-8765",
          paid: true,
          course: "Advanced Fluid Mechanics",
          location: "Toronto, Canada",
        },
        {
          id: 5,
          name: "Eva Martinez",
          email: "eva@example.com",
          phone: "555-2468",
          paid: false,
          course: "Advanced Fluid Mechanics",
          location: "Madrid, Spain",
        },
      ],
    },
    {
      id: 3,
      title: "Engineering Drawing & CAD",
      image:
        "https://i.pinimg.com/1200x/04/f1/12/04f112c19b9e3228861692ccd57c02cf.jpg",
      students: [],
    },
    {
      id: 4,
      title: "Finite Element Analysis (FEA)",
      image:
        "https://i.pinimg.com/736x/ac/36/dc/ac36dc239fd5d8a3118cc57c6f33e286.jpg",
      students: [
        {
          id: 6,
          name: "Frank Wilson",
          email: "frank@example.com",
          phone: "555-1357",
          paid: true,
          course: "Finite Element Analysis (FEA)",
          location: "Berlin, Germany",
        },
      ],
    },
  ];

  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set()
  );
  const [viewStudentId, setViewStudentId] = useState<number | null>(null);

  const toggleCourse = (id: number) => {
    const newSet = new Set(expandedCourses);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCourses(newSet);
  };

  const getTotalStudents = () =>
    mockCourses.reduce((sum, course) => sum + course.students.length, 0);

  const getPaidStudents = () =>
    mockCourses.reduce(
      (sum, course) => sum + course.students.filter((s) => s.paid).length,
      0
    );

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header & Stats */}
      <div className="mb-8 w-full">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Enrollment
            </h1>
            <p className="text-gray-600">
              Manage course enrollments and student information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Courses */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockCourses.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTotalStudents()}
                </p>
              </div>
            </div>
          </div>

          {/* Paid Students */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPaidStudents()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {mockCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            {/* Course Header */}
            <div
              className="flex justify-between items-center px-6 py-5 cursor-pointer hover:bg-gray-100 transition-all duration-300"
              onClick={() => toggleCourse(course.id)}
            >
              <div className="flex items-center gap-8">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                ) : (
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {course.title}
                  </h3>
                  <p className="text-sm sm:block hidden text-gray-600">
                    Click to view enrollments
                  </p>

                  <span
                    className={`px-4 py-2 sm:hidden block w-[50%] rounded-full text-sm font-semibold ${
                      course.students.length > 0
                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {course.students.length}{" "}
                    {course.students.length === 1 ? "student" : "students"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-4 py-2 sm:block hidden rounded-full text-sm font-semibold ${
                    course.students.length > 0
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {course.students.length}{" "}
                  {course.students.length === 1 ? "student" : "students"}
                </span>
                <div>
                  {expandedCourses.has(course.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Student Table */}
            {expandedCourses.has(course.id) && (
              <div className="border-t border-gray-200/50 bg-gray-50/50 overflow-x-auto">
                {course.students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      No enrollment requests
                    </p>
                    <p className="text-gray-400 text-sm">
                      Students will appear here when they enroll
                    </p>
                  </div>
                ) : (
                  <table className="w-full border-separate border-spacing-y-4">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="px-6 py-4 text-sm font-semibold w-[20%] text-gray-900">
                          Student
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold w-[20%] text-gray-900">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold w-[20%] text-gray-900">
                          Location
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold w-[20%] text-gray-900">
                          Payment
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold w-[20%] text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.students.map((student) => (
                        <React.Fragment key={student.id}>
                          <tr className="bg-white rounded-md shadow-md overflow-hidden hover:bg-gray-50 transition-all duration-200">
                            <td className="px-6 py-4 w-[20%]  text-black rounded-l-md">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-semibold">
                                    {student.name}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4  w-[20%]">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-4 h-4" />
                                  {student.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  {student.phone}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4  w-full  text-black flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4" />
                              {student.location}
                            </td>

                            <td className="px-6 py-4  w-[20%]">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                                  student.paid
                                    ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800"
                                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800"
                                }`}
                              >
                                <CreditCard className="w-3 h-3" />
                                {student.paid ? "Paid" : "Pending"}
                              </span>
                            </td>

                            <td className="px-6 py-4 w-[10%] rounded-r-md">
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg"
                                onClick={() =>
                                  setViewStudentId(
                                    viewStudentId === student.id
                                      ? null
                                      : student.id
                                  )
                                }
                              >
                                <Eye className="w-4 h-4 text-blue-500" />
                              </button>
                            </td>
                          </tr>

                          {viewStudentId === student.id && (
                            <tr>
                              <td colSpan={5} className="px-6 py-4">
                                <div className="relative p-6 bg-gradient-to-r from-white/90 to-blue-50/90 rounded-xl border border-white/50 shadow-lg backdrop-blur-sm">
                                  <button
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/80 transition-colors"
                                    onClick={() => setViewStudentId(null)}
                                  >
                                    <X className="w-4 h-4 text-gray-500" />
                                  </button>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                                        Student Details
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <Users className="w-5 h-5 text-blue-600" />
                                          <span className="font-medium text-gray-700">
                                            Name:
                                          </span>
                                          <span className="text-gray-900">
                                            {student.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <Mail className="w-5 h-5 text-blue-600" />
                                          <span className="font-medium text-gray-700">
                                            Email:
                                          </span>
                                          <span className="text-gray-900">
                                            {student.email}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <Phone className="w-5 h-5 text-blue-600" />
                                          <span className="font-medium text-gray-700">
                                            Phone:
                                          </span>
                                          <span className="text-gray-900">
                                            {student.phone}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                                        Enrollment Info
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <BookOpen className="w-5 h-5 text-blue-600" />
                                          <span className="font-medium text-gray-700">
                                            Course:
                                          </span>
                                          <span className="text-gray-900">
                                            {student.course}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <MapPin className="w-5 h-5 text-blue-600" />
                                          <span className="font-medium text-gray-700">
                                            Location:
                                          </span>
                                          <span className="text-gray-900">
                                            {student.location}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <CreditCard className="w-5 h-5 text-blue-600" />
                                          <span className="font-medium text-gray-700">
                                            Payment:
                                          </span>
                                          <span
                                            className={`font-semibold ${
                                              student.paid
                                                ? "text-green-600"
                                                : "text-amber-600"
                                            }`}
                                          >
                                            {student.paid
                                              ? "Payment Complete"
                                              : "Payment Pending"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsRequest;
