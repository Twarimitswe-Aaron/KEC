import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashBoard/DashboardLayout.tsx";
import Inbox from "./layouts/Inbox/Inbox"
import RequestedUsers from "./routes/RequestedUsers";

import Dashboard from "./routes/Dashboard";
import Login from "./Pages/Login/LoginPage.tsx";
import Signup from "./Pages/Login/Signup.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Landing from "./Landing/Landing";
import Verification from "./Pages/Login/verification";
import PassReset from "./Pages/Login/PassReset";
import UserManagement from "./routes/UserManagement";
import CourseManagement from "./routes/courseManagement"
import AdminCourseManagement from "./routes/AdminCourseManagement"
import Announcements from "./routes/Announcements";
import MyProfile from "./routes/MyProfile";
import Feedback from "./routes/Feedback";
import Logout from "./routes/Logout"
import PaymentManagement from "./routes/PaymentManagement";
import Certificates from "./routes/Certificates";


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
    <Route path="/passReset" element={<PassReset />} />

    {/* Protected routes with DashboardLayout */}
    <Route element={<DashboardLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/user-management" element={<UserManagement/>} />
      <Route path="/course-creation" element={<CourseManagement/>}/>
      <Route path="/course-management" element={<AdminCourseManagement/>}/>
      <Route path="/announcements" element={<Announcements/>}/>
      <Route path="/my-account" element={<MyProfile/>}/>
      <Route path="/feedback" element={<Feedback/>}/>
      <Route path="/payment-management" element={<PaymentManagement/>}/>
      <Route path="/certificate-creation" element={<Certificates/>}/>
      <Route path="/course-management/students" element={<RequestedUsers/>}/>
      <Route path="/logout" element={<Logout/>}/>

    </Route>
    <Route path="/inbox" element={<Inbox/>} />
  </Routes></>
  );
}

export default App;
