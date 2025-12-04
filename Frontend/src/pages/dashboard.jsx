import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Appcontent } from "../context/authContext";
import axios from "axios";

function Dashboard() {
  const { userData } = useContext(Appcontent);

  // Store rooms in state (now storing FULL ROOM OBJECTS)
  const [ownRooms, setOwnRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);

  // --------------------------------------------------------
  // Load all rooms for the logged-in user
  // --------------------------------------------------------
  const loadAllRooms = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/user/get-user-rooms",
        { withCredentials: true }
      );

      if (res.data.success) {
        // Store room objects (not IDs)
        setOwnRooms(res.data.ownrooms || []);
        setJoinedRooms(res.data.joinedrooms || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Load rooms on mount
  useEffect(() => {
    loadAllRooms();
  }, []);

  return (
    <div>
      <Navbar />

      {/* Welcome Section */}
      <div className="mt-8 mb-6">
        <h1 className="text-3xl font-bold">Welcome, {userData?.userName}</h1>
        <p className="text-gray-400 mt-2">Email: {userData?.email}</p>
      </div>

      {/* ------------------------------- */}
      {/* OWN ROOMS SECTION */}
      {/* ------------------------------- */}
      <h2 className="text-2xl font-semibold mt-6 mb-3">Your Created Rooms</h2>

      {ownRooms.length === 0 ? (
        <p className="text-gray-500">You haven’t created any rooms yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ownRooms.map((room) => (
            <div
              key={room._id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => (window.location.href = `/room/${room._id}`)}
            >
              <h3 className="text-lg font-semibold">{room.title}</h3>
              <p className="text-gray-600 text-sm mt-1">
                Room Code: {room.roomCode}
              </p>
              
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------- */}
      {/* JOINED ROOMS SECTION */}
      {/* ------------------------------- */}
      <h2 className="text-2xl font-semibold mt-10 mb-3">Rooms You Joined</h2>

      {joinedRooms.length === 0 ? (
        <p className="text-gray-500">You haven’t joined any rooms yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {joinedRooms.map((room) => (
            <div
              key={room._id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => (window.location.href = `/room/${room._id}`)}
            >
              <h3 className="text-lg font-semibold">{room.title}</h3>
              <p className="text-gray-600 text-sm mt-1">
                Room Code: {room.roomCode}
              </p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
