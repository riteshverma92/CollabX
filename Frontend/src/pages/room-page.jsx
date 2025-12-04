import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import WhiteBoard from "../whiteboard/WhiteBoard.jsx";
import { objectManager } from "../whiteboard/core/objectManager.js";

export default function RoomPage() {
  const { roomId } = useParams();
  const wsRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  // controls showing/hiding chat panel
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    // NOTE: change ws URL if your server runs on a different host/port or wss for production
    const ws = new WebSocket(`ws://localhost:8080?roomId=${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("ws open", roomId);
    };

    ws.onmessage = (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        return;
      }

      if (data.type === "init") {
        // full state from server
        objectManager.setObjects(data.objects || []);
        return;
      }

      if (data.type === "object:add") {
        objectManager.addObject(data.object);
        return;
      }

      if (data.type === "object:delete") {
        objectManager.deleteObject(data.id);
        return;
      }

      if (data.type === "chat") {
        setMessages((p) => [...p, data]);
        return;
      }
    };

    ws.onclose = () => {
      console.log("ws closed");
    };

    ws.onerror = (err) => {
      console.error("ws error", err);
    };

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [roomId]);

  const sendChat = () => {
    if (!msg.trim()) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        text: msg,
      })
    );

    setMessages((p) => [...p, { text: msg, userId: "you" }]);
    setMsg("");
  };

  return (
    <div className="h-screen w-screen flex relative">
      {/* WHITEBOARD AREA */}
      <div className={`flex-1 transition-all duration-300`}>
        <WhiteBoard wsRef={wsRef} />
      </div>

      {/* CHAT PANEL */}
      <div
        className={`bg-gray-900 text-white h-full flex flex-col border-l border-gray-700
        transition-all duration-300 
        ${chatOpen ? "w-80" : "w-0 overflow-hidden"}`}
      >
        {/* CHAT HEADER */}
        <div className="p-4 text-lg font-bold border-b border-gray-700 flex justify-between items-center">
          Chat
          <button
            onClick={() => setChatOpen(false)}
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className="bg-gray-700 p-2 rounded">
              {m.text}
            </div>
          ))}
        </div>

        {/* CHAT INPUT */}
        <div className="p-3 flex gap-2">
          <input
            className="flex-1 p-2 bg-gray-700 rounded"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
          />
          <button onClick={sendChat} className="px-4 bg-purple-600 rounded">
            Send
          </button>
        </div>
      </div>

      {/* CHAT FLOATING BUTTON (WHEN CHAT IS HIDDEN) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="absolute right-4 top-4 bg-purple-600 text-white px-4 py-2 rounded shadow-lg hover:bg-purple-700 transition"
        >
          Open Chat
        </button>
      )}
    </div>
  );
}
