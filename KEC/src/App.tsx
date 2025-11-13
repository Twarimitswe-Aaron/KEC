import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashBoard/DashboardLayout.tsx";
import AdminCourseManagementLayout from "./layouts/DashBoard/AdminCourseManagementLayout";
import Inbox from "./layouts/Inbox/Inbox";
import RequestedCourses from "./routes/RequestedCourses";
import CreateModule from "./routes/CreateModule";
import LessonsView from "./Components/LessonsView.tsx";
import Dashboard from "./routes/Dashboard";
import Login from "./Pages/Login/LoginPage.tsx";

import Signup from "./Pages/Login/Signup.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Landing from "./Landing/Landing";
import Verification from "./Pages/Login/verification";
import PasswordReset from "./Pages/Login/PasswordReset";
import ForgotPass from "./Pages/Login/ForgotPass";
import UserManagement from "./routes/UserManagement";
import CourseManagement from "./routes/courseManagement";
import AdminCourseManagement from "./routes/AdminCourseManagement";
import Announcements from "./routes/Announcements";
import MyProfile from "./routes/MyProfile";
import ProfilePage from "./routes/ProfilePage"
import Feedback from "./routes/Feedback";
import Logout from "./routes/Logout";
import PaymentManagement from "./routes/PaymentManagement";
import Certificates from "./routes/Certificates";
import StudentsRequest from "./Components/StudentsRequest";
import UserLessonsView from "./Components/UserLessonsView.tsx";
import Tasks from "./Components/Tasks.tsx";

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/verification" element={<Verification />} />
        <Route path="/forgotPass" element={<ForgotPass />} />
        <Route path="/passReset" element={<PasswordReset />} />

        {/* Protected routes with DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/course/id" element={<UserLessonsView />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/course-creation" element={<CourseManagement />} />
          <Route path="/course-creation/course/id" element={<LessonsView />} />
          <Route
            path="/course-management/create-modules"
            element={<CreateModule />}
          />
          <Route
            path="/course-management/:id"
            element={<LessonsView />}
          />
          <Route
            path="/course-management"
            element={<AdminCourseManagementLayout />}
          >
            <Route path="students" element={<StudentsRequest />} />
            <Route path="requestedCourses" element={<RequestedCourses />} />
            <Route path="" element={<AdminCourseManagement />} />
          </Route>
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/my-account" element={<MyProfile />} />
          <Route path="/profile/:id" element={<ProfilePage />} />

          <Route path="/feedback" element={<Feedback />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/certificate-creation" element={<Certificates />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
        <Route path="/inbox" element={<Inbox />} />
      </Routes>
      
    </>
  );
}

export default App;
