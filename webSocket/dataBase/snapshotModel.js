import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema(
  {
    roomId: { type: String, unique: true },
    objects: { type: Array },
  },
  { timestamps: true }
);

const Snapshot = mongoose.model("Snapshot", snapshotSchema);

export default Snapshot;
