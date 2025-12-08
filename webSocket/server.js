import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import crypto from "crypto";
import "dotenv/config";

const rooms = {};  // roomId -> { clients: [], objects: [] }
const users = {};  // socketUserId -> { name, avatar, color }

const wss = new WebSocketServer({ port: 8080 });
console.log("WS running at ws://localhost:8080");

wss.on("connection", (socket, req) => {

  // optional: token check
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    socket.close();
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    socket.close();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const roomId = url.searchParams.get("roomId");

  if (!roomId) {
    socket.close();
    return;
  }

  if (!rooms[roomId]) rooms[roomId] = { clients: [], objects: [] };
  rooms[roomId].clients.push(socket);

  socket.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

  
    if (data.type === "identify") {

      socket._userId = data.unique_id
      socket._name = data.name;


      users[socket._userId] = {
        name: data.name,
        avatar: `https://api.dicebear.com/8.x/thumbs/svg?seed=${socket._userId}`,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16)
      };



      // send objects after identity
      socket.send(JSON.stringify({
        type: "init",
        objects: rooms[roomId].objects
      }));

      return;
    }

    // ---------- ADD OBJECT ----------
    if (data.type === "object:add") {
      rooms[roomId].objects.push(data.object);

      const payload = JSON.stringify({
        type: "object:add",
        object: data.object
      });

      rooms[roomId].clients.forEach(c => c.readyState === 1 && c.send(payload));
      return;
    }

    // ---------- DELETE OBJECT ----------
    if (data.type === "object:delete") {
      rooms[roomId].objects = rooms[roomId].objects.filter(
        obj => obj.id !== data.id
      );

      const payload = JSON.stringify({
        type: "object:delete",
        id: data.id
      });

      rooms[roomId].clients.forEach(c => c.readyState === 1 && c.send(payload));
      return;
    }

    // ---------- CHAT MESSAGE ----------
    if (data.type === "chat") {
      const info = users[socket._userId];

      const payload = JSON.stringify({
        type: "chat",
        text: data.text,
        name: info.name,
        color: info.color,
        avatar: info.avatar,
        timestamp: Date.now()
      });

      rooms[roomId].clients.forEach(c => c.readyState === 1 && c.send(payload));
      return;
    }
  });

  socket.on("close", () => {
    rooms[roomId].clients = rooms[roomId].clients.filter(c => c !== socket);
  });
});
