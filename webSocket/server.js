import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import "dotenv/config";

const rooms = {};
const users = {};

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
    rooms[roomId] = { clients: new Set(), objects: [] };
  }

  rooms[roomId].clients.add(socket);

  socket.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    // IDENTIFY
    if (data.type === "identify") {
      socket._userId = data.unique_id;
      users[socket._userId] = {
        name: data.name,
        avatar: `https://api.dicebear.com/8.x/thumbs/svg?seed=${socket._userId}`,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };

      socket.send(
        JSON.stringify({
          type: "init",
          objects: rooms[roomId].objects,
        })
      );
      return;
    }

    // ADD OBJECT
    if (data.type === "object:add") {
      rooms[roomId].objects.push(data.object);

      broadcast(roomId, socket, {
        type: "object:add",
        object: data.object,
      });
      return;
    }

    // DELETE OBJECT
    if (data.type === "object:delete") {
      rooms[roomId].objects = rooms[roomId].objects.filter(
        (o) => o.id !== data.id
      );

      broadcast(roomId, socket, {
        type: "object:delete",
        id: data.id,
      });
      return;
    }

    // CHAT
    if (data.type === "chat") {
      const user = users[socket._userId];
      if (!user) return;

      broadcast(roomId, socket, {
        type: "chat",
        text: data.text,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
        timestamp: Date.now(),
      });
    }
  });

  socket.on("close", () => {
    rooms[roomId]?.clients.delete(socket);
    if (rooms[roomId]?.clients.size === 0) delete rooms[roomId];
  });
});

function broadcast(roomId, sender, payload) {
  const msg = JSON.stringify(payload);
  rooms[roomId].clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}
