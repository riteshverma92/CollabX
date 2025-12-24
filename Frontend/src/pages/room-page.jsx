import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import WhiteBoard from "../whiteboard/WhiteBoard.jsx";
import { MessageCircleMore, Minimize2, Send } from "lucide-react";

export default function RoomPage() {
  const { roomId } = useParams();
  const wsRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const { userData } = useSelector((state) => state.auth);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Custom cursor
  useEffect(() => {
    const cursor = document.getElementById("customCursor");

    const moveCursor = (e) => {
      if (!cursor) return;
      cursor.style.left = `${e.pageX}px`;
      cursor.style.top = `${e.pageY}px`;
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  // WebSocket setup
  useEffect(() => {
    if (!userData) return;

    const ws = new WebSocket(`ws://localhost:8080?roomId=${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "identify",
          unique_id: userData.userID,
          name: userData.userName,
        })
      );
    };

    ws.onmessage = (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        return;
      }

      // ✅ CHAT ONLY (NO WHITEBOARD MUTATION)
      if (data.type === "chat") {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => ws.close();
  }, [roomId, userData]);

  const sendChat = () => {
    if (!msg.trim()) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        text: msg,
      })
    );

    setMsg("");
  };

  return (
    <div className="h-screen w-screen flex flex-row relative overflow-hidden">
      {/* CUSTOM CURSOR */}
      <div
        id="customCursor"
        className="
          pointer-events-none absolute w-5 h-5 rounded-full
          bg-red-500/10 border border-red-500/30
          -translate-x-1/2 -translate-y-1/2 z-50 hidden
        "
      />

      {/* WHITEBOARD */}
      <div className="flex-1 cursor-none">
        <WhiteBoard wsRef={wsRef} />
      </div>

      {/* CHAT PANEL */}
      <div
        className={`
          fixed right-0 top-0 h-full bg-[#17212B] text-white
          transition-all duration-300
          ${chatOpen ? "w-80" : "w-0 overflow-hidden"}
        `}
      >
        {chatOpen && (
          <>
            <div className="p-4 flex justify-between bg-[#242F3D]">
              <h2 className="text-blue-400 font-bold">Room Chat</h2>
              <button onClick={() => setChatOpen(false)}>
                <Minimize2 />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className="mb-2">
                  {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 flex gap-2">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                className="flex-1 p-2"
              />
              <button onClick={sendChat}>
                <Send />
              </button>
            </div>
          </>
        )}
      </div>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed top-4 right-4 bg-blue-500 p-2 rounded"
        >
          <MessageCircleMore />
        </button>
      )}
    </div>
  );
}
