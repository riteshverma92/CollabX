import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { userName, email, password } = formData;

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      if (data.success) {
        toast.success("Otp send Successfully on Email");
        navigate("/otp-verification", { state: { email: formData.email } });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 text-white flex items-center justify-center min-h-screen px-6 relative">
      {/* Background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 blur-[150px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/50 border border-white/10 px-8 py-10 rounded-2xl shadow-xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mt-2">
          Join CollabX and start collaborating.
        </p>

        {/* FORM */}
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {/* Name */}
          <div>
            <label className="text-gray-300 text-sm">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl outline-none 
                         focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl outline-none 
                         focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl outline-none 
                         focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-500 
                       to-purple-500 hover:from-blue-600 hover:to-purple-600 transition shadow-md 
                       disabled:opacity-40"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Redirect */}
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
