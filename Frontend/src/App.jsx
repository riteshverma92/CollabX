import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";

import LandingPage from "./pages/landingPage.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import OtpVerfication from "./pages/OtpVerfication.jsx";
import Forgotpassword from "./pages/Forgotpassword.jsx";
import VerifyOtp from "./pages/VerifyOtpForgot.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import Dashboard from "./pages/dashboard.jsx";
import RoomPage from "./pages/room-page.jsx";


import { checkAuth, getUserData } from "./redux/slices/authSlice.js";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth()).then((res) => {
      if (res.payload === true) {
        dispatch(getUserData());
      }
    });
  }, [dispatch]);

  return (
    <div>
      <ToastContainer />

      <Routes>
       
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OtpVerfication />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/verify-otp-forgot-password" element={<VerifyOtp />}
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
