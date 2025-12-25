import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import "dotenv/config";

const rooms = {}; // { roomId: { clients:Set, objects:[], users:Set } }
const users = {}; // { userId: { name, avatar, color } }

const wss = new WebSocketServer({ port: 8080 });
console.log("✅ WS running at ws://localhost:8080");

wss.on("connection", (socket, req) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) return socket.close();

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return socket.close();
  }

  const url = new URL(req.url, "http://localhost");
  const roomId = url.searchParams.get("roomId");
  if (!roomId) return socket.close();

  if (!rooms[roomId]) {
    rooms[roomId] = {
      clients: new Set(),
      objects: [],
      users: new Set(), // ✅ room users
    };
  }

  rooms[roomId].clients.add(socket);

  socket.on("message", (msg) => {
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

      // send initial room state to new user
      socket.send(
        JSON.stringify({
          type: "init",
          objects: rooms[roomId].objects,
          users: getRoomUsers(roomId),
        })
      );

      // notify others
      broadcast(roomId, {
        type: "user:joined",
        users: getRoomUsers(roomId),
      });

      return;
    }

    // ---------------- OBJECT ADD ----------------
    if (data.type === "object:add") {
      rooms[roomId].objects.push(data.object);
      broadcast(roomId, { type: "object:add", object: data.object });
      return;
    }

    // ---------------- OBJECT DELETE ----------------
    if (data.type === "object:delete") {
      rooms[roomId].objects = rooms[roomId].objects.filter(
        (o) => o.id !== data.id
      );
      broadcast(roomId, { type: "object:delete", id: data.id });
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
  });

  // ---------------- LEAVE ----------------
  socket.on("close", () => {
    rooms[roomId]?.clients.delete(socket);

    if (socket._userId) {
      rooms[roomId]?.users.delete(socket._userId);
      delete users[socket._userId];

      broadcast(roomId, {
        type: "user:left",
        users: getRoomUsers(roomId),
      });
    }

    if (rooms[roomId]?.clients.size === 0) {
      delete rooms[roomId];
    }
  });
});

function getRoomUsers(roomId) {
  const result = {};
  rooms[roomId]?.users.forEach((id) => {
    if (users[id]) result[id] = users[id];
  });
  return result;
}

function broadcast(roomId, payload) {
  const msg = JSON.stringify(payload);
  rooms[roomId]?.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}
