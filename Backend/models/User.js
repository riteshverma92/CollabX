import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName:{ type: String, required: true },
  email:{ type: String, required: true, unique: true },
  password:{ type: String, required: true },
  rooms :{type: mongoose.Schema.Types.ObjectId}
  
});

export default mongoose.model("User", userSchema);
