import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

import {
  Trash2,
  Share2,
  Users,
  Crown,
  CircleMinus,
  Loader,
} from "lucide-react";

import { useSelector } from "react-redux";
import Loading from "./Loading";

// ------------------------------
// Avatar Color Logic
// ------------------------------

const avatarColors = [
  "#4D9FFF",
  "#B38BFF",
  "#5DE4C7",
  "#F2A65A",
  "#FF6464",
  "#7BDAF7",
];

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function Avatar({ name }) {
  return (
    <div
      className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold border border-white/20"
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}

// ------------------------------

export default function Dashboard() {
  // 🔁 CONTEXT ➜ REDUX (ONLY CHANGE)
  const { userData } = useSelector((state) => state.auth);

  const [ownRooms, setOwnRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch rooms
  const loadAllRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/user/get-user-rooms",
        { withCredentials: true }
      );

      if (res.data.success) {
        setOwnRooms(res.data.ownrooms || []);
        setJoinedRooms(res.data.joinedrooms || []);
      }
    } catch {
      toast.error("Error fetching rooms");
    } finally {
      setLoading(false);
    }
  };

  // Delete room
  const deleteRoom = async (roomId) => {
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/room/delete-room",
        { data: { roomId }, withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Deleted");
        loadAllRooms();
      }
    } catch {
      toast.error("Error deleting room");
    }
  };

  // Remove room
  const removeRoom = async (roomId) => {
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/room/remove-room",
        { data: { roomId }, withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Room Removed");
        loadAllRooms();
      }
    } catch {
      toast.error("Error deleting room");
    }
  };

  // Copy code
  const copyRoomCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied");
    } catch {
      toast.error("Failed");
    }
  };

  useEffect(() => {
    loadAllRooms();
    const listener = () => loadAllRooms();
    window.addEventListener("rooms-updated", listener);
    return () => window.removeEventListener("rooms-updated", listener);
  }, []);

  if (loading) {
    return <Loading/>;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-white">
      {/* Sticky Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        {/* Header */}
        <h1 className="text-3xl font-semibold">
          Welcome, <span className="text-white/90">{userData?.userName}</span>
        </h1>

        <p className="text-white/50 mt-1 flex items-center gap-2">
          <span className="pulse-dot" /> Ready to collaborate
        </p>

        {/* QUICK STATS */}
        <div className="flex flex-wrap gap-6 mt-6">
          {/* CREATED ROOMS */}
          <div className="flex items-center gap-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl px-6 py-5 min-w-[260px]">
            <Crown className="w-7 h-7 text-[hsl(var(--primary))]" />
            <div>
              <p className="text-3xl font-semibold">{ownRooms.length}</p>
              <p className="text-white/40 text-sm mt-1">Created Rooms</p>
            </div>
          </div>

          {/* JOINED ROOMS */}
          <div className="flex items-center gap-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl px-6 py-5 min-w-[260px]">
            <Users className="w-7 h-7 text-[hsl(var(--accent))]" />
            <div>
              <p className="text-3xl font-semibold">{joinedRooms.length}</p>
              <p className="text-white/40 text-sm mt-1">Joined Rooms</p>
            </div>
          </div>
        </div>

        {/* CREATED ROOMS */}
        <h2 className="text-xl font-medium mt-12 mb-4">Your Created Rooms</h2>

        {ownRooms.length === 0 ? (
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-10 text-center">
            <Crown className="w-10 h-10 mx-auto text-white/20 mb-4" />
            <p className="text-white/50">No rooms created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownRooms.map((room) => (
              <div
                key={room._id}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 hover:bg-white/[0.06] transition cursor-pointer"
                onClick={() => (window.location.href = `/room/${room._id}`)}
              >
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium truncate">{room.title}</h3>

                  <div className="flex gap-2">
                    <button
                      className="p-1.5 rounded-lg transition-transform duration-200 group hover:scale-125 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyRoomCode(room.roomCode);
                      }}
                    >
                      <Share2 className="w-4 h-4 text-white/50 group-hover:text-[hsl(var(--accent))] " />
                    </button>

                    <button
                      className="p-1.5 rounded-lg transition-transform duration-200 group hover:scale-125 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoom(room._id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-white/50 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-white/40">
                  Room Code:
                  <span className="ml-2 px-2 py-1 text-xs rounded-md bg-white/[0.06] border">
                    {room.roomCode}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* JOINED ROOMS */}
        <h2 className="text-xl font-medium mt-12 mb-4">Rooms You Joined</h2>

        {joinedRooms.length === 0 ? (
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-10 text-center">
            <Users className="w-10 h-10 mx-auto text-white/20 mb-4" />
            <p className="text-white/50">You haven’t joined any rooms yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedRooms.map((room) => (
              <div
                key={room._id}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 hover:bg-white/[0.06] transition cursor-pointer"
                onClick={() => (window.location.href = `/room/${room._id}`)}
              >
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium truncate">{room.title}</h3>

                  <button
                    className="p-1.5 rounded-lg transition-transform duration-200 group hover:scale-125 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRoom(room._id);
                    }}
                  >
                    <CircleMinus className="w-4 h-4 text-white/50 group-hover:text-blue-500" />
                  </button>
                </div>

                <p className="text-sm text-white/40">
                  Room Code:
                  <span className="ml-2 px-2 py-1 text-xs rounded-md bg-white/[0.06] border">
                    {room.roomCode}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
