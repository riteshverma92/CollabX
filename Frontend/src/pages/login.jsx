import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(formData));

    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative flex items-center justify-center px-4 font-inter">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/25 blur-[170px] rounded-full"></div>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md bg-white/[0.03] 
        border border-white/[0.08] px-10 py-12 rounded-2xl 
        backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]"
      >
        <form className="space-y-6" onSubmit={handleLogin}>
          <h1
            className="text-4xl font-bold text-center bg-gradient-to-r 
            from-blue-400 to-purple-400 text-transparent bg-clip-text"
          >
            Welcome Back
          </h1>

          {/* Email */}
          <input
            type="email"
            required
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/[0.05] 
              border border-white/[0.1] rounded-xl 
              text-gray-200 placeholder-gray-500 
              focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* Password */}
          <input
            type="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/[0.05] 
              border border-white/[0.1] rounded-xl 
              text-gray-200 placeholder-gray-500 
              focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-lg 
              bg-gradient-to-r from-blue-600 to-purple-600 
              hover:from-blue-700 hover:to-purple-700 
              transition shadow-lg shadow-blue-900/30 
              disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Register */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 font-medium hover:text-blue-300 transition"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
