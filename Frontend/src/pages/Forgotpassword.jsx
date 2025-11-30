import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    againpassword: "",
  });

  const { email, password, againpassword } = formData;

  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/password-reset",
        formData
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/verify-otp-forgot-password", { state: { email } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative flex items-center justify-center px-4 font-inter">

      {/* Background Blur Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/25 blur-[170px] rounded-full"></div>
      </div>

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md bg-white/[0.03] 
                      border border-white/[0.08] px-10 py-12 
                      rounded-2xl backdrop-blur-xl 
                      shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">

        <h1 className="text-3xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Reset Password
        </h1>

        <p className="text-gray-400 text-center mt-2">
          Enter details to receive OTP
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSendOtp}>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] 
                         rounded-xl text-gray-200 placeholder-gray-500 
                         focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] 
                         rounded-xl text-gray-200 placeholder-gray-500 
                         focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              value={againpassword}
              onChange={(e) =>
                setFormData({ ...formData, againpassword: e.target.value })
              }
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] 
                         rounded-xl text-gray-200 placeholder-gray-500 
                         focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-lg 
                       bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 
                       transition shadow-lg shadow-blue-900/30 
                       disabled:opacity-40"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ForgotPassword;
