import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRider } from "./context/RiderContext";
import Navbar from "./components/Navbar/Navbar";
import BottomNav from "./components/BottomNav/BottomNav";

// Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ActiveDelivery from "./pages/ActiveDelivery/ActiveDelivery";
import Earnings from "./pages/Earnings/Earnings";
import Profile from "./pages/Profile/Profile";

const ProtectedLayout = () => {
  const { token } = useRider();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="rider-main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/active-trip" element={<ActiveDelivery />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
};

const App = () => {
  const { token } = useRider();

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </>
  );
};

export default App;
