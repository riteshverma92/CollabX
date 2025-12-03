// server.js
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import "dotenv/config";

const rooms = {}; // roomId -> { clients: [], objects: [] }

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server running on ws://localhost:8080");

wss.on("connection", (socket, req) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) return socket.close();

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return socket.close();
  }

  const url = new URL(req.url, "http://localhost");
  const roomId = url.searchParams.get("roomId");
  if (!roomId) return socket.close();

  if (!rooms[roomId]) rooms[roomId] = { clients: [], objects: [] };

  socket._userId = user.id;
  rooms[roomId].clients.push(socket);

  // send current board to newly joined client
  socket.send(JSON.stringify({ type: "init", objects: rooms[roomId].objects }));

  // handle messages
  socket.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    // finalize object -> persist and broadcast to all clients
    if (data.type === "object:add") {
      rooms[roomId].objects.push(data.object);

      const payload = JSON.stringify({ type: "object:add", object: data.object });
      rooms[roomId].clients.forEach((c) => {
        if (c.readyState === 1) c.send(payload);
      });
      return;
    }

    // chat -> broadcast to others
    if (data.type === "chat") {
      const payload = JSON.stringify(data);
      rooms[roomId].clients.forEach((c) => {
        if (c !== socket && c.readyState === 1) c.send(payload);
      });
      return;
    }
  });

  socket.on("close", () => {
    rooms[roomId].clients = rooms[roomId].clients.filter((c) => c !== socket);
  });

  socket.on("error", () => {});
});
