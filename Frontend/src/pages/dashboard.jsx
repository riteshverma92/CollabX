import React, { useContext, useState } from "react";
import { Appcontent } from "../context/authContext.jsx";
import Loading from "./Loading.jsx";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { userData, loading } = useContext(Appcontent);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [input, setRoomEntry] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openCopyModal, setOpenCopyModal] = useState(false);

  

  // -----------------------------
  // CREATE ROOM
  // -----------------------------
  const createRoomforUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/room/create-room",
        { title },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
// Backend roomId
        setCreatedRoomId(res.data.roomCode);

        setOpenCreateModal(false);
        setOpenCopyModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // -----------------------------
  // JOIN ROOM
  // -----------------------------
  const joinRoom = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/room/join-room",
        { input},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Room Joined Successfully");
        setOpenJoinModal(false);
         if (res.data.roomLink) {
        navigate(res.data.roomLink);
      } else if (res.data.roomId) {
        navigate(`/room/${res.data.roomId}`);
      } else {
        toast.error("No room link returned from server");
      }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join room");
    }
  };

  // -----------------------------
  // COPY ROOM ID
  // -----------------------------
  const copyRoomId = () => {
    navigator.clipboard.writeText(createdRoomId);
    toast.success("Room ID Copied!");
    setOpenCopyModal(false)
  };

  if (loading) return <Loading />;

  return (
    <div className="text-white bg-black min-h-screen p-6">
      <Navbar />

      {/* Profile */}
      <div className="flex items-center gap-4 mt-6">
        <div
          className="w-12 h-12 rounded-full bg-[#14141A]
            shadow-[0_0_25px_-5px_#6d28d9,inset_0_0_12px_rgba(255,255,255,0.05)]
            flex items-center justify-center text-xl font-semibold border border-white/10"
        >
          {userData?.userName?.[0]?.toUpperCase()}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{userData.userName}</h1>
          <p className="text-gray-400">{userData.email}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => setOpenCreateModal(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
        >
          Create Room
        </button>

        <button
          onClick={() => setOpenJoinModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Join Room
        </button>
      </div>

      {/* ----------------------------- */}
      {/* CREATE ROOM MODAL */}
      {/* ----------------------------- */}
      {openCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-80 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-black">Create Room</h2>

            <input
              type="text"
              placeholder="Enter Room Title"
              onChange={(e) => setTitle(e.target.value)}
              className="text-black w-full border border-gray-300 px-3 py-2 rounded-lg mb-4 
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenCreateModal(false)}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-black"
              >
                Cancel
              </button>

              <button
                onClick={createRoomforUser}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------- */}
      {/* JOIN ROOM MODAL */}
      {/* ----------------------------- */}
      {openJoinModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-80 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-black">Join Room</h2>

            <input
              onChange={(e) => setRoomEntry(e.target.value)}
              type="text"
              placeholder="Enter Room ID"
              className="text-black w-full border border-gray-300 px-3 py-2 rounded-lg mb-4
                         focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenJoinModal(false)}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-black"
              >
                Cancel
              </button>

              <button
                onClick={joinRoom}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------- */}
      {/* COPY ROOM ID MODAL */}
      {/* ----------------------------- */}
      {openCopyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-xl shadow-lg text-black">
            <h2 className="text-xl font-semibold mb-4">Room Created</h2>

            <p className="text-gray-700 mb-3">Share this Room ID:</p>

            <div className="w-full bg-gray-100 p-3 rounded-lg font-mono text-gray-900 text-center">
              {createdRoomId}
            </div>

            <button
              onClick={copyRoomId}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Copy Room ID
            </button>

            <button
              onClick={() => setOpenCopyModal(false)}
              className="mt-3 w-full border border-gray-400 text-black py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      <div className="mt-8">
        <h1 className="text-3xl font-bold">Welcome, {userData.userName}</h1>
        <p className="text-gray-400 mt-2">Email: {userData.email}</p>
      </div>
    </div>
  );
}

export default Dashboard;
