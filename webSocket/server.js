// server.js
// Minimal WebSocket server that stores per-room object state in memory,
// broadcasts finalized object additions and deletions, and returns the full
// board to newly joined clients.
//
// NOTE: in production you should persist rooms[roomId].objects to DB and
// use Redis pub/sub for multi-server scaling.

import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import "dotenv/config";

const rooms = {}; // in-memory: roomId -> { clients: [], objects: [] }

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server running on ws://localhost:8080");

wss.on("connection", (socket, req) => {
  // parse token from cookies for authentication (keeps your original pattern)
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) {
    socket.close(); // no token -> reject connection
    return;
  }

  let user;
  try {
    // jwt.verify throws if invalid; keep server secure by rejecting invalid tokens
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    socket.close();
    return;
  }

  // read roomId from query string
  const url = new URL(req.url, "http://localhost");
  const roomId = url.searchParams.get("roomId");
  if (!roomId) {
    socket.send(JSON.stringify({ type: "system", text: "Missing roomId" }));
    socket.close();
    return;
  }

  // initialize room container if needed
  if (!rooms[roomId]) rooms[roomId] = { clients: [], objects: [] };

  // attach lightweight user id to socket for server-side metadata
  socket._userId = user.id;
  rooms[roomId].clients.push(socket);

  // send current board state (init) to the newly connected client
  socket.send(JSON.stringify({ type: "init", objects: rooms[roomId].objects }));

  // message handling
  socket.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      // ignore invalid JSON from clients; don't crash server
      return;
    }

    // attach server-side metadata
    data.userId = socket._userId;
    data.timestamp = Date.now();

    // When client finalizes a new object, persist in room objects and broadcast
    if (data.type === "object:add" && data.object) {
      rooms[roomId].objects.push(data.object);

      const payload = JSON.stringify({
        type: "object:add",
        object: data.object,
        userId: socket._userId,
        timestamp: Date.now(),
      });

      // broadcast to all clients in room (including sender so all keep same state)
      rooms[roomId].clients.forEach((c) => {
        if (c.readyState === 1) c.send(payload);
      });
      return;
    }

    // When client deletes an object, remove from room objects and broadcast deletion
    if (data.type === "object:delete" && data.id) {
      rooms[roomId].objects = rooms[roomId].objects.filter((o) => o.id !== data.id);

      const payload = JSON.stringify({
        type: "object:delete",
        id: data.id,
        userId: socket._userId,
        timestamp: Date.now(),
      });

      rooms[roomId].clients.forEach((c) => {
        if (c.readyState === 1) c.send(payload);
      });
      return;
    }

    // Chat messages: broadcast to other clients only
    if (data.type === "chat") {
      const payload = JSON.stringify({ ...data, userId: socket._userId, timestamp: Date.now() });
      rooms[roomId].clients.forEach((c) => {
        if (c !== socket && c.readyState === 1) c.send(payload);
      });
      return;
    }

    // Unknown message types are ignored for now
  });

  socket.on("close", () => {
    // remove socket from room
    rooms[roomId].clients = rooms[roomId].clients.filter((c) => c !== socket);
    // optionally cleanup empty rooms here
  });
});
