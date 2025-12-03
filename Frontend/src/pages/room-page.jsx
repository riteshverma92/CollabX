// src/pages/RoomPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import WhiteBoard from "../WhiteBoard";
import { objectManager } from "../WhiteBoard/engine/objectManager";

export default function RoomPage() {
  const { roomId } = useParams();
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?roomId=${roomId}`);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);

      if (data.type === "init") {
        objectManager.setObjects(data.objects || []);
        return;
      }

      if (data.type === "object:add") {
        // add shapes from other users
        objectManager.addObject(data.object);
        return;
      }

      if (data.type === "chat") {
        setMessages((p) => [...p, data]);
      }
    };

    ws.onerror = (e) => console.error("WS error", e);
    ws.onopen = () => console.log("WS open");
    ws.onclose = () => console.log("WS closed");

    return () => {
      try { ws.close(); } catch {}
    };
  }, [roomId]);

  const sendChat = () => {
    if (!msg.trim()) return;
    const payload = { type: "chat", text: msg };
    wsRef.current?.send(JSON.stringify(payload));
    setMessages((p) => [...p, { text: msg, userId: "you" }]);
    setMsg("");
  };

  return (
    <div className="h-screen flex">
      <div className="flex-1">
        <WhiteBoard wsRef={wsRef} />
      </div>

      <div className="w-80 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-gray-700">Chat</div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className="p-2 bg-gray-700 rounded">{m.text}</div>
          ))}
        </div>

        <div className="p-3 flex gap-2">
          <input className="flex-1 p-2 bg-gray-700 rounded" value={msg} onChange={(e) => setMsg(e.target.value)} />
          <button onClick={sendChat} className="px-4 bg-purple-600 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
