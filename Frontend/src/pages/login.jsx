import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Appcontent } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedin,userData, setUserData, setLoading, loading } = useContext(Appcontent); 


  // form states
  const [formData, setformData] = useState({
    email: "",
    password: ""
  });

  const { email, password } = formData;



  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/login`,
        formData, 
        { withCredentials: true }                      
      );

    
      if (data.success) {
        toast.success("Login successful!");
        setIsLoggedin(true);
        setUserData(data.userData);
        navigate("/dashboard");
      } else {
        toast.error("you are not register Please Register");
      }
    } catch (err) {
       toast.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative flex items-center justify-center px-4 font-inter">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/25 blur-[170px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/[0.03] border border-white/[0.08] px-10 py-12 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">

        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Sign in to continue building with your team.
          </p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleLogin}>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) =>
                setformData({ ...formData, email: e.target.value })   // <-- FIXED
              }
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setformData({ ...formData, password: e.target.value }) // <-- FIXED
              }
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div className="flex justify-end">
            <Link to ="/forgot-password" type="button" className="text-blue-400 text-sm hover:text-blue-300">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r 
                       from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       transition shadow-lg shadow-blue-900/30 disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-400 font-medium hover:text-blue-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
