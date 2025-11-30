import React, { useContext } from "react";
import { Appcontent } from "../context/authContext.jsx";
import Loading from "./Loading.jsx";
import Navbar from "../components/Navbar.jsx";

function Dashboard() {
  const { userData, loading } = useContext(Appcontent);

  // Still loading from backend
  if (loading) {
    return <Loading />;
  }

  // Logged in
  return (
    <div className="text-white bg-black p-6">
      <Navbar></Navbar>
      

<div className="w-12 h-12 rounded-full bg-[#14141A]
            shadow-[0_0_25px_-5px_#6d28d9,inset_0_0_12px_rgba(255,255,255,0.05)]
            flex items-center justify-center 
            text-white text-xl font-semibold 
            backdrop-blur-xl border border-white/10">
  {userData?.userName?.[0]?.toUpperCase()}
</div>







<div className="flex items-center gap-4">
  

  <div>
    <h1 className="text-2xl font-bold text-white">{userData.userName}</h1>
    <p className="text-gray-400">{userData.email}</p>
  </div>
</div>







      <h1 className="text-3xl font-bold">Welcome, {userData.userName}</h1>
      <p className="text-gray-400 mt-2">Email: {userData.email}</p>
    </div>
  );
}

export default Dashboard;
