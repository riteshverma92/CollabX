import { WebSocketServer } from "ws";
import { authenticate } from "../utils/auth.js";
import { rooms, users } from "./rooms.js";
import { handleMessage } from "./handlers.js";
import { broadcast } from "./broadcast.js";
import { saveSnapshot } from "../dataBase/snapshot.repo.js";

const wss = new WebSocketServer({ port: 8080 });
console.log("WS running at ws://localhost:8080");

wss.on("connection", (socket, req) => {
  if (!authenticate(req)) return socket.close();

  const url = new URL(req.url, "http://localhost");
  const roomId = url.searchParams.get("roomId");
  if (!roomId) return socket.close();

  if (!rooms[roomId]) {
    rooms[roomId] = {
      clients: new Set(),
      objects: [],
      users: new Set(),
    };
  }

  rooms[roomId].clients.add(socket);

  socket.on("message", (msg) => {
    handleMessage(socket, roomId, msg);
  });

  socket.on("close", async () => {
    rooms[roomId]?.clients.delete(socket);

    if (socket._userId) {
      rooms[roomId]?.users.delete(socket._userId);
      delete users[socket._userId];

      
      broadcast(roomId, {
        type: "user:left",
        users: Object.fromEntries(
          [...rooms[roomId]?.users || []].map(id => [id, users[id]])
        ),
      });
    }

   
    if (rooms[roomId]?.clients.size === 0) {
      await saveSnapshot(roomId, rooms[roomId].objects);
      delete rooms[roomId];
    }
  });
});
