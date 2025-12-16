import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";

import Loading from "../pages/Loading";
import {
  setUserData,
  setIsLoggedin,
  setLoading,
} from "../redux/slices/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🔹 Redux state
  const { userData, loading } = useSelector((state) => state.auth);

  // 🔹 Local UI state
  const [title, setTitle] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // Close profile dropdown
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return <Loading />;

  /* =========================
     CREATE ROOM
  ========================= */
  const createRoom = async () => {
    if (!title.trim()) return toast.error("Enter room title");

    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        "http://localhost:5000/api/room/create-room",
        { title },
        { withCredentials: true }
      );

      if (res.data.success) {
        const id =
          res.data.roomCode || res.data.roomId || res.data._id;

        await navigator.clipboard.writeText(id);
        toast.success("Room Created & Copied!");
        window.dispatchEvent(new Event("rooms-updated"));
        setOpenCreateModal(false);
        setTitle("");
      }
    } catch {
      toast.error("Failed to create room");
    } finally {
      dispatch(setLoading(false));
    }
  };

  /* =========================
     JOIN ROOM
  ========================= */
  const joinRoom = async () => {
    if (!roomInput.trim()) return toast.error("Enter room code");

    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        "http://localhost:5000/api/room/join-room",
        { input: roomInput },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Joined Room");
        setOpenJoinModal(false);
        setRoomInput("");
        window.dispatchEvent(new Event("rooms-updated"));

        navigate(
          `/room/${res.data.roomId || res.data.room?._id || res.data._id}`
        );
      }
    } catch {
      toast.error("Join failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      dispatch(setUserData(null));
      dispatch(setIsLoggedin(false));

      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[hsl(var(--background)/0.75)] border-b border-[hsl(var(--border))]">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* BRAND */}
          <h1 className="text-2xl font-black bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CollabX
          </h1>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-[#7a3fd8] border-none cursor-pointer text-white group hover:bg-[#743ad3]  hover:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]
  hover:-translate-y-[1px]"
            >
              + Create Room
            </button>

            <button
              onClick={() => setOpenJoinModal(true)}
              className="px-4 py-2 rounded-lg bg-green-800 border-none cursor-pointer text-white/80 hover: bg-green-900 hover:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]
  hover:-translate-y-[1px]"
            >
              Join Room
            </button>

            {/* PROFILE */}
            <div className="relative border-none" ref={profileRef}>
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-11 h-11 rounded-full border text-white flex items-center justify-center cursor-pointer border-neutral-700"
              >
                {userData?.userName?.[0]?.toUpperCase()}
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 p-4 rounded-xl border bg-[hsl(var(--card))] border-none">
                  <p className="text-lg font-semibold">
                    {userData?.userName}
                  </p>
                  <p className="text-sm text-white/40 mb-4">
                    {userData?.email}
                  </p>

                  <button
                    onClick={logout}
                    className="w-full py-2 rounded-lg bg-[#237667] text-white cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* =========================
         CREATE ROOM MODAL
      ========================= */}
      {openCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 w-[380px]">
            <h2 className="text-xl font-semibold mb-4">Create Room</h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Room Title"
              className="w-full mb-4 px-4 py-2 rounded-lg bg-black/30 border border-white/20"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenCreateModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={createRoom}
                className="px-4 py-2 rounded-lg bg-[#854ce2] text-white"

              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
         JOIN ROOM MODAL
      ========================= */}
      {openJoinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 w-[380px]">
            <h2 className="text-xl font-semibold mb-4">Join Room</h2>

            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Room Code"
              className="w-full mb-4 px-4 py-2 rounded-lg bg-black/30 border border-white/20"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenJoinModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={joinRoom}
                className="px-4 py-2 rounded-lg bg-[#854ce2] text-white"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
