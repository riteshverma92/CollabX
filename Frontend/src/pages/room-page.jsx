import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import WhiteBoard from "../whiteboard/WhiteBoard.jsx";
import { objectManager } from "../whiteboard/core/objectManager.js";
import { MessageCircleMore, Minimize2, Send } from "lucide-react";
import { Appcontent } from "../context/authContext.jsx";

export default function RoomPage() {
  const { roomId } = useParams();
  const wsRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const { userData } = useContext(Appcontent);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ------------------------------------------------------
  // ✨ CUSTOM CURSOR ONLY INSIDE WHITEBOARD AREA
  // ------------------------------------------------------
  useEffect(() => {
    const cursor = document.getElementById("customCursor");

    const moveCursor = (e) => {
      cursor.style.left = `${e.pageX}px`;
      cursor.style.top = `${e.pageY}px`;
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);
  // ------------------------------------------------------

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?roomId=${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS Connected");

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

      if (data.type === "init") {
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
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => ws.close();
  }, [roomId]);

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

      {/* CUSTOM CURSOR — ONLY FOR WHITEBOARD */}
      <div
        id="customCursor"
        className="
          pointer-events-none 
          absolute 
          w-5 h-5 rounded-full 
          bg-red-500/10 
          border border-red-500/30 
          shadow-[0_0_8px_rgba(255,0,0,0.25)]
          -translate-x-1/2 -translate-y-1/2 
          z-50
          hidden
        "
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-[#615e5e] rounded-full"></div>
        </div>
      </div>


      {/* WHITEBOARD AREA */}
      <div
        className="flex-1 cursor-none"
        onMouseEnter={() => {
          document.getElementById("customCursor").classList.remove("hidden");
        }}
        onMouseLeave={() => {
          document.getElementById("customCursor").classList.add("hidden");
        }}
      >
        <WhiteBoard wsRef={wsRef} />
      </div>

      {/* CHAT PANEL */}
      <div
        className={`
    fixed right-0 top-0 h-full bg-[#17212B] text-white shadow-xl border-l border-[#2A3B4D]
    flex flex-col transition-all duration-300
    ${chatOpen ? "w-80" : "w-0 overflow-hidden"}
  `}
      >
        {chatOpen && (
          <div className="p-4 flex items-center justify-between bg-[#242F3D] border-b border-[#2A3B4D]">
            <h2 className="text-xl font-bold text-blue-400">Room Chat</h2>

            <button
              onClick={() => setChatOpen(false)}
              className="p-2 hover:bg-[#1E2B36] rounded cursor-pointer"
            >
              <Minimize2 />
            </button>
          </div>
        )}

        {chatOpen && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
            {messages.map((m, i) => {
              const plainName = m.name.replace(/#.*/, "");
              const isMe = plainName === userData.userName;

              return (
                <div key={i} className="flex w-full">
                  <div
                    className={`
                px-4 py-2 rounded-xl shadow-md text-sm
                ${
                  isMe
                    ? "bg-[#4C98F7] text-white"
                    : "bg-[#1E2B36] text-gray-200"
                }
              `}
                    style={{
                      maxWidth: "75%",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <div>{m.text}</div>

                    <div
                      className="flex justify-between items-center mt-2 text-[10px] opacity-80"
                      style={{ minWidth: "150px" }}
                    >
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <span
                        className="font-semibold"
                        style={{ color: isMe ? "white" : m.color }}
                      >
                        {plainName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}

        {chatOpen && (
          <div className="p-4 flex gap-3 bg-[#242F3D] border-t border-[#2A3B4D]">
            <input
              className="flex-1 bg-[#0E1621] border border-[#2A3B4D] p-2 rounded-lg text-gray-200"
              placeholder="Type a message..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
            />

            <button
              onClick={sendChat}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
            >
              <Send className="text-white cursor-pointer" />
            </button>
          </div>
        )}
      </div>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed top-4 right-4 bg-blue-500 px-4 py-2 rounded-lg text-white shadow-lg cursor-pointer"
        >
          <MessageCircleMore />
        </button>
      )}
    </div>
  );
}
