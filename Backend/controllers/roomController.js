import Room from "../models/Room.js";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create Room to Join
export const createRoom = async (req, res) => {
  const { title } = req.body;
  const userID = req.body.userID;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  try {
    const roomCode = generateRoomCode();
    const room = await Room.create({
      title,
      roomCode,
      owner: userID,
      users: [userID],
    });

    

    return res.status(200).json({
      success: true,
      message: "Room created successfully",
      room,
      roomLink: `/room/${room._id}`,
      roomCode: roomCode
    });
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
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


    if (input.includes("/room/")) {
      try {
        const roomId = input.split("/room/")[1].trim();
        room = await Room.findOne({ _id: roomId }); // FIXED
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Link not Working: Invalid",
        });
      }
    }

    // Case 2: user enters code
    else {
      try {
        const code = input.trim().toUpperCase();
        room = await Room.findOne({ roomCode: code }); // FIXED
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid room code format",
        });
      }
    }

    // Room not found
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Add user if not already in room
    if (!room.users.includes(userID)) {   
      room.users.push(userID);
      await room.save();
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



export const removeUser = async (req, res) => {
  try {
    const { roomId, targetUserId, userID } = req.body;
    const room = await Room.findById({_id: roomId});

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.owner.toString() !== userID.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can remove users",
      });
    }

   
    if (targetUserId.toString() === room.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: "Owner cannot be removed from the room",
      });
    }

   
    room.users = room.users.filter(
      (id) => id.toString() !== targetUserId
    );

    await room.save();

    return res.status(200).json({
      success: true,
      message: "User removed successfully",
    });

  } catch (err) {
    console.log("REMOVE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


