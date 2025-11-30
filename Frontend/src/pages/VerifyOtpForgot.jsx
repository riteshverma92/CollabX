import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  if (!email) {
    return (
      <div className="text-center text-white p-10">
        <h2>Email missing. Go back and try again.</h2>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/verify-otp-resetpassword", {
        email,
        otp,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative flex items-center justify-center px-4 font-inter">

      {/* Background blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/25 blur-[170px] rounded-full"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/[0.03] 
                      border border-white/[0.08] px-10 py-12 
                      rounded-2xl backdrop-blur-xl 
                      shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">

        <h2 className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Verify OTP
        </h2>

        <p className="text-gray-400 text-center mt-2">
        Enter OTP, It is send to <span className="text-blue-400">{email}</span>
        </p>

        <form className="mt-5 space-y-5" onSubmit={handleVerify}>

          <div className="space-y-2">
            <label className="text-gray-300 text-md font-medium">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] 
                         rounded-xl text-gray-200 placeholder-gray-500 
                         focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-lg 
                       bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 
                       transition shadow-lg shadow-blue-900/30"
          >
            Verify OTP
          </button>

        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
