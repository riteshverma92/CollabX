import mongoose from "mongoose";

export const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  roomCode: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Room", roomSchema);
