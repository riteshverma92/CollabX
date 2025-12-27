import { rooms } from "./rooms.js";

export function broadcast(roomId, payload) {
  const msg = JSON.stringify(payload);

  rooms[roomId]?.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}
