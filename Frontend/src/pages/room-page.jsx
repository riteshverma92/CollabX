import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

function RoomPage() {
  const { roomId } = useParams();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

 
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?roomId=${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket Connected");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        console.warn("Invalid WS message:", event.data);
      }
    };

    ws.onerror = (err) => console.error("WS Error:", err);
    ws.onclose = () => console.log("WS Closed");

    return () => ws.close();
  }, [roomId]);


  const sendMessage = () => {
    if (!msg.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== 1) return;

    wsRef.current.send(JSON.stringify({ text: msg }));
    setMsg("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 text-xl font-bold border-b border-white/10">
        Room ID: {roomId}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className="max-w-xs px-4 py-2 rounded-lg bg-gray-700 text-white mr-auto"
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 flex gap-3">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Type a message..."
          className="flex-1 bg-white/10 px-4 py-2 rounded-lg outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-purple-600 px-5 py-2 rounded-lg hover:bg-purple-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default RoomPage;
