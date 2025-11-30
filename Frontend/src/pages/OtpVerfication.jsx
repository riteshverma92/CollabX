import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultEmail = location.state?.email || "";
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!defaultEmail) {
      toast.error("Email missing, please register again.");
      navigate("/register");
    }
  }, []);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp }
      );

      if (data.success) {
        toast.success("OTP Verified! Please Login");
        navigate("/login");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // Automatically verify when OTP becomes 6 digits


  return (
    <div className="bg-gray-950 text-white flex items-center justify-center min-h-screen px-6 relative">

      <div className="relative z-10 w-full max-w-md bg-gray-900/50 border border-white/10 px-8 py-10 rounded-2xl shadow-xl backdrop-blur-xl">

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Verify Email
        </h1>

        <p className="text-gray-400 text-center mt-2">
          Enter the OTP sent to your email.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full mt-2 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">OTP</label>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl outline-none tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-500
                       to-purple-500 hover:from-blue-600 hover:to-purple-600 transition shadow-md 
                       disabled:opacity-40"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
