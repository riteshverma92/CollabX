import axios from "axios";
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../pages/Loading";
import { Appcontent } from "../context/authContext";

export default function Navbar() {
  const { userData, loading } = useContext(Appcontent);
  const navigate = useNavigate();

  // ---------------------------
  // Component States
  // ---------------------------
  const [title, setTitle] = useState("");
  const [input, setRoomEntry] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openProfileDropdown, setOpenProfileDropdown] = useState(false);

  // Reference for detecting outside clicks on the profile dropdown
  const profileRef = useRef();

  // ---------------------------
  // Close profile dropdown when clicking outside
  // ---------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show loading screen if user data is still loading
  if (loading) return <Loading />;

  // ---------------------------
  // Create Room Handler
  // ---------------------------
  const createRoom = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/room/create-room",
        { title },
        { withCredentials: true }
      );

      if (res.data.success) {
        const roomID = res.data.roomCode;
        setCreatedRoomId(roomID);

        // Automatically copy room ID to clipboard
        navigator.clipboard.writeText(roomID);

        toast.success("Room Created & Room ID copied to clipboard");

        // Close modal
        setOpenCreateModal(false);
      }
    } catch {
      toast.error("Failed to create room");
    }
  };

  // ---------------------------
  // Join Room Handler
  // ---------------------------
  const joinRoom = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/room/join-room",
        { input },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Joined Room");
        setOpenJoinModal(false);

        // Navigate to room
        if (res.data.roomLink) navigate(res.data.roomLink);
        else navigate(`/room/${res.data.roomId}`);
      }
    } catch {
      toast.error("Failed to join room");
    }
  };

  // ---------------------------
  // User Logout Handler
  // ---------------------------
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      toast.success("Logged Out");
      navigate("/login");
    } catch {
      toast.error("Logout Failed");
    }
  };

  return (
    <div className=" bg-[#F5F6F8]">

      {/* ---------------------------------------------------------------- */}
      {/* TOP NAVIGATION BAR */}
      {/* ---------------------------------------------------------------- */}
      <nav className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center shadow-sm">

        {/* Left Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenCreateModal(true)}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
          >
            + Create Room
          </button>

          <button
            onClick={() => setOpenJoinModal(true)}
            className="px-4 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-800 transition"
          >
            Join Room
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setOpenProfileDropdown(!openProfileDropdown)}
            className="w-11 h-11 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
          >
            {userData?.userName?.[0]?.toUpperCase()}
          </div>

          {openProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fadeIn">

              <p className="text-lg font-semibold text-gray-800">{userData.userName}</p>
              <p className="text-gray-500 mb-4 text-sm">{userData.email}</p>

              <button
                onClick={logout}
                className="w-full bg-gray-900 text-white py-2.5 rounded-md hover:bg-black transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ================================================================ */}
      {/* CREATE ROOM MODAL */}
      {/* ================================================================ */}
      {openCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-80 p-6 rounded-lg shadow-xl border border-gray-200">

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Room</h2>

            <input
              type="text"
              placeholder="Enter room title"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={createRoom}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* JOIN ROOM MODAL */}
      {/* ================================================================ */}
      {openJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-80 p-6 rounded-lg shadow-xl border border-gray-200">

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Join Room</h2>

            <input
              type="text"
              placeholder="Room ID or Link"
              onChange={(e) => setRoomEntry(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenJoinModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={joinRoom}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
