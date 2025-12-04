import Room from "../models/Room.js";
import User from "../models/User.js";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create Room to Join and push room into User

export const createRoom = async (req, res) => {
  const { title, userID } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }

  if (!userID) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  try {
    // 1️⃣ Create Room
    const roomCode = generateRoomCode();

    const room = await Room.create({
      title,
      roomCode,
      owner: userID,
      users: [userID],
    });

    // 2️⃣ Add roomId to user's rooms array
    await User.findByIdAndUpdate(
      userID,
      { $push: { ownrooms: room._id } },
      { new: true }
    );

    // 3️⃣ Respond once
    return res.status(200).json({
      success: true,
      message: "Room created successfully",
      roomId: room._id,
      roomLink: `/room/${room._id}`,
      roomCode
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};





export const joinRoom = async (req, res) => {
  try {
    const { input, userID } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Please Enter RoomCode or RoomLink",
      });
    }

    let room = null;

    // Case 1: link
    if (input.includes("/room/")) {
      const roomId = input.split("/room/")[1].trim();
      room = await Room.findById(roomId);
    } 
    // Case 2: code
    else {
      const code = input.trim().toUpperCase();
      room = await Room.findOne({ roomCode: code });
    }

    // If no room found
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Add user to room (if not already)
    if (!room.users.some(id => id.toString() === userID)) {
      room.users.push(userID);
      await room.save();
    }

    // Add room to joinedrooms
    const userfromdatabase = await User.findById(userID);

    if (!userfromdatabase.joinedrooms.some(id => id.toString() === room._id.toString())) {
      userfromdatabase.joinedrooms.push(room._id);
      await userfromdatabase.save();
    }

    return res.status(200).json({
      success: true,
      message: "Joined room successfully",
      roomId: room._id,
    });

  } catch (err) {
    console.log("JOIN ROOM ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


















// export const removeUser = async (req, res) => {
//   try {
//     const { roomId, targetUserId, userID } = req.body;
//     const room = await Room.findById({_id: roomId});

//     if (!room) {
//       return res.status(404).json({
//         success: false,
//         message: "Room not found",
//       });
//     }

//     if (room.owner.toString() !== userID.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Only the owner can remove users",
//       });
//     }

//     if (targetUserId.toString() === room.owner.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: "Owner cannot be removed from the room",
//       });
//     }

//     room.users = room.users.filter(
//       (id) => id.toString() !== targetUserId
//     );

//     await room.save();

//     return res.status(200).json({
//       success: true,
//       message: "User removed successfully",
//     });

//   } catch (err) {
//     console.log("REMOVE USER ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };
