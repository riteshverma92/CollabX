import axios from "axios";
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../pages/Loading";
import { Appcontent } from "../context/authContext";

export default function Navbar() {
  const { userData, loading , setUserData, setIsLoggedin} = useContext(Appcontent);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef();

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

  // Create Room
  const createRoom = async () => {
    try {
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
      }
    } catch {
      toast.error("Failed to create room");
    }
  };

  // Join Room
  const joinRoom = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/room/join-room",
        { input: roomInput },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Joined Room");
        setOpenJoinModal(false);
        window.dispatchEvent(new Event("rooms-updated"));

        navigate(
          res.data.roomLink ||
          `/room/${res.data.roomId ||
            res.data.room?._id ||
            res.data._id}`
        );
      }
    } catch {
      toast.error("Join failed");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        { withCredentials: true }
      );
      
      toast.success("Logged out");
      setUserData(null);
      setIsLoggedin(false)
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 
        backdrop-blur-xl bg-[hsl(var(--background)/0.75)] 
        border-b border-[hsl(var(--border))]"
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* LEFT — BRAND NAME */}
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CollabX
          </h1>

          {/* RIGHT — BUTTONS */}
          <div className="flex items-center gap-4">

            {/* CREATE BUTTON */}
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] 
              text-[hsl(var(--primary-foreground))] hover:brightness-110 transition cursor-pointer"
            >
              + Create Room
            </button>

            {/* JOIN BUTTON */}
            <button
              onClick={() => setOpenJoinModal(true)}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--card))] 
              border border-[hsl(var(--border))] text-white/80 
              hover:bg-green-800 transition cursor-pointer"
            >
              Join Room
            </button>

            {/* PROFILE AVATAR */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-11 h-11 rounded-full bg-[hsl(var(--card))] 
                border border-[hsl(var(--border))] text-white flex 
                items-center justify-center cursor-pointer hover:bg-white/[0.08] transition"
              >
                {userData?.userName?.[0]?.toUpperCase()}
              </div>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 p-4 rounded-xl 
                  bg-[hsl(var(--card))] border border-[hsl(var(--border))] 
                  shadow-xl animate-fade-in"
                >
                  <p className="text-lg font-semibold text-white">{userData.userName}</p>
                  <p className="text-sm text-white/40 mb-4">{userData.email}</p>

                  <button
                    onClick={logout}
                    className="w-full py-2 rounded-lg 
    bg-[hsl(var(--accent))] 
    text-[hsl(var(--accent-foreground))] 
    hover:brightness-110 transition"
>
                  
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </nav>
      </div>

      {/* ---- CREATE MODAL ---- */}
      {openCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center 
          bg-black/50 backdrop-blur-sm">

          <div className="w-80 p-6 rounded-xl bg-[hsl(var(--card))] 
            border border-[hsl(var(--border))] shadow-xl animate-fade-in"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Create Room</h2>

            <input
              type="text"
              placeholder="Room Title"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] 
              border border-[hsl(var(--border))] text-white outline-none 
              focus:border-[hsl(var(--primary))] transition mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] 
                text-white/60 hover:bg-white/[0.06]"
              >
                Cancel
              </button>

              <button
                onClick={createRoom}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] 
                text-white hover:brightness-110"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- JOIN MODAL ---- */}
      {openJoinModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center 
          bg-black/50 backdrop-blur-sm">

          <div className="w-80 p-6 rounded-xl bg-[hsl(var(--card))] 
            border border-[hsl(var(--border))] shadow-xl animate-fade-in"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Join Room</h2>

            <input
              type="text"
              placeholder="Room ID or Link"
              onChange={(e) => setRoomInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] 
              border border-[hsl(var(--border))] text-white outline-none 
              focus:border-[hsl(var(--primary))] transition mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenJoinModal(false)}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] 
                text-white/60 hover:bg-white/[0.06]"
              >
                Cancel
              </button>

              <button
                onClick={joinRoom}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] 
                text-white hover:brightness-110"
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
