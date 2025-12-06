import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName:{ type: String, required: true },
  email:{ type: String, required: true, unique: true },
  password:{ type: String, required: true },

  ownrooms: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Room" }
  ],

  joinedrooms: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Room" }
  ]
});

export default mongoose.model("User", userSchema);
