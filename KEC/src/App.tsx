import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./routes/Dashboard";
import Login from "./Pages/Login/LoginPage.tsx";
import Signup from "./Pages/Login/Signup.tsx";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import Landing from "./Landing/Landing";
import Verification from "./Pages/Login/verification";

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
    theme="colored"
    />
    <Routes>
    
    <Route path="/" element={<Landing />} />

  
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/verification" element={<Verification />} />

    {/* Protected routes with DashboardLayout */}
    <Route element={<DashboardLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>
  </Routes></>
  );
}

export default App;
