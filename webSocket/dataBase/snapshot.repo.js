import Snapshot from "../dataBase/snapshotModel.js";

export async function saveSnapshot(roomId, objects) {
    console.log("autosave for room:", roomId);
  await Snapshot.updateOne(
    { roomId },
    { $set: { objects } },
    { upsert: true }
  );
}

export async function loadSnapshot(roomId) {
  return Snapshot.findOne({ roomId }).lean();
}




