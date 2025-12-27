import { rooms, users, getRoomUsers, getCount } from "./rooms.js";
import { broadcast } from "./broadcast.js";
import { loadSnapshot, saveSnapshot } from "../dataBase/snapshot.repo.js";

export async function handleMessage(socket, roomId, msg) {
  let data;
  try {
    data = JSON.parse(msg.toString());
  } catch {
    return;
  }

  // ---------------- IDENTIFY ----------------
  if (data.type === "identify") {
    socket._userId = data.unique_id;

    users[socket._userId] = {
      userId: socket._userId,
      name: data.name,
      avatar: `https://api.dicebear.com/8.x/thumbs/svg?seed=${socket._userId}`,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };

    rooms[roomId].users.add(socket._userId);

    //  CASE 1: first user in room → load snapshot
    if (!rooms[roomId].loaded) {
      const snapshot = await loadSnapshot(roomId);
      if (snapshot && snapshot.objects) {
        rooms[roomId].objects = snapshot.objects;
      }
      rooms[roomId].loaded = true;
    }

    //  CASE 2: room already active → ensure DB has latest
    if (rooms[roomId].dirty) {
      await saveSnapshot(roomId, rooms[roomId].objects);
      rooms[roomId].dirty = false;
    }

    socket.send(
      JSON.stringify({
        type: "init",
        objects: rooms[roomId].objects,
        users: getRoomUsers(roomId),
      })
    );

    broadcast(roomId, {
      type: "user:joined",
      users: getRoomUsers(roomId),
    });

    console.log("Identity handled correctly");
    return;
  }

  // ---------------- OBJECT ADD ----------------
  if (data.type === "object:add") {
    rooms[roomId].objects.push(data.object);
    rooms[roomId].dirty = true;

    broadcast(roomId, {
      type: "object:add",
      object: data.object,
    });

    return;
  }

  // ---------------- OBJECT DELETE ----------------

  if (data.type === "object:delete") {
    rooms[roomId].objects = rooms[roomId].objects.filter(
      (o) => o.id !== data.id
    );

    rooms[roomId].dirty = true;
    broadcast(roomId, {
      type: "object:delete",
      id: data.id,
    });
    return;
  }

  // ---------------- CHAT ----------------
  if (data.type === "chat") {
    const user = users[socket._userId];
    if (!user) return;

    broadcast(roomId, {
      type: "chat",
      text: data.text,
      name: user.name,
      avatar: user.avatar,
      color: user.color,
      timestamp: Date.now(),
    });
  }
}
