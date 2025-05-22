
import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./routes/Dashboard";
import Login from "./Pages/LoginPages/LoginPage.tsx";
import Signup from "./Pages/Signup.tsx";

import "./App.css";
import Landing from "./Landing/Landing";
function App() {
  return (
    <Routes>
    
      <Route path="/" element={<Landing />} />

    
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes with DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
