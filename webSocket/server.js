import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import 'dotenv/config';

const rooms = {};

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server running on ws://localhost:8080");

wss.on("connection", (socket, req) => {

  const cookies = cookie.parse(req.headers.cookie || "");
  let token = cookies.token;

  if (!token) {
    socket.close();
    return;
  }


  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    
    socket.close();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const roomId = url.searchParams.get("roomId");

  if (!roomId) {
    socket.send("Room ID missing");
    socket.close();
    return;
  }

  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(socket);


  
  socket.send(
    JSON.stringify({
      clientId: "server",
      text: `Welcome`,
    })
  );

socket.on("message", (msg) => {
  let data;

  // ----------------------------
  // 1. Parse incoming message
  // ----------------------------
  try {
    data = JSON.parse(msg.toString().trim());
  } catch (err) {
    console.log("Received invalid JSON:", msg.toString());
    return; // never crash on bad input
  }

  // ----------------------------
  // 2. Attach authenticated user data
  // ----------------------------
  data.userId = user.id;
  data.timestamp = Date.now();


  if (!rooms[roomId]) {
    console.log("Room does not exist:", roomId);
    return;
  }

 
  const payload = JSON.stringify(data);

  rooms[roomId].forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
});



  socket.on("close", () => {
    rooms[roomId] = rooms[roomId].filter((c) => c !== socket);
    console.log(`User left room ${roomId}`);
  });
});
