import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageCircleMore, Minimize2, Send, Users } from "lucide-react";
import Board from "../WhiteBoard2/Board.jsx";

export default function RoomPage() {
  const { roomId } = useParams();
  const wsRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [OnlineOpen, setOnlineOpen] = useState(false);

  const [boardEvent, setBoardEvent] = useState(null);

  const messagesEndRef = useRef(null);
  const { userData } = useSelector((state) => state.auth);

  const [allUsers, setAllUsers] = useState({});

  // ---------------- AUTO SCROLL CHAT ----------------
  const autoScroll = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    if (chatOpen) {
      autoScroll(false);
    }
  }, [chatOpen]);

  useEffect(() => {
    autoScroll(true);
  }, [messages]);

  // ---------------- CUSTOM CURSOR ----------------
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

  // ---------------- WEBSOCKET SETUP ----------------
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

      if (data.type === "user:joined" || data.type === "user:left") {
        setAllUsers(data.users);
        return;
      }

      if (data.type === "chat") {
        setMessages((prev) => [...prev, data]);
        return;
      }

      // ✅ ONLY board-related events reach here
      setBoardEvent(data);
    };

    ws.onerror = (err) => console.error("WS Error:", err);
    ws.onclose = () => console.log("WS Closed");

    return () => ws.close();
  }, [roomId, userData]);

  // ---------------- SEND CHAT ----------------
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
    <div className="h-screen w-screen flex relative overflow-hidden">
      {/* CUSTOM CURSOR */}
      <div
        id="customCursor"
        className="
    pointer-events-none absolute w-5 h-5 rounded-full
    bg-red-500/10 border border-red-500/30
    -translate-x-1/2 -translate-y-1/2 z-50 hidden
    flex items-center justify-center
  "
      >
        <div className="w-1 h-1 rounded-full bg-[#cacaca71]" />
      </div>

      {/* WHITEBOARD */}
      <div
        className="flex-1 cursor-none"
        onMouseEnter={() =>
          document.getElementById("customCursor")?.classList.remove("hidden")
        }
        onMouseLeave={() =>
          document.getElementById("customCursor")?.classList.add("hidden")
        }
      >
        <Board wsRef={wsRef} events={boardEvent} />
      </div>

      {/* CHAT PANEL */}
      <div
        className={`
    fixed right-0 top-0 h-screen overflow-hidden
    bg-[#17212B] text-white
    transition-all duration-300
    shadow-[-4px_0_12px_rgba(255,255,255,0.1)]

    ${chatOpen ? "w-80" : "w-0 overflow-hidden"}
    flex flex-col
  `}
      >
        {chatOpen && (
          <>
            {/* HEADER */}
            <div className="p-4 flex justify-between items-center bg-[#242F3D] cursor-default">
              <h1 className="text-blue-400 font-bold ">Room Chat</h1>
              <button
                onClick={() => setChatOpen(false)}
                className="cursor-pointer"
              >
                <Minimize2 />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
              {messages.map((m, i) => {
                const isMe = m.name === userData?.userName;

                return (
                  <div
                    key={i}
                    className={`flex items-end ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMe && (
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                    )}

                    <div
                      className="
                        px-3 py-2 rounded-md text-sm
                        min-w-[50%] max-w-[70%]
                        break-words whitespace-pre-wrap
                        bg-[#242F3D] text-white
                      "
                      style={isMe ? { backgroundColor: "#3b82f6" } : {}}
                    >
                      <div>{m.text}</div>

                      <div className="flex justify-between items-center mt-1 text-[10px] text-indigo-200">
                        {!isMe ? (
                          <span
                            className="font-medium truncate max-w-[70%]"
                            style={{ color: m.color }}
                          >
                            {m.name}
                          </span>
                        ) : (
                          <span />
                        )}

                        <span className="ml-2 shrink-0">
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ✅ REQUIRED FOR AUTO SCROLL */}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-3 flex items-center gap-2 bg-[#242F3D]">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
                className="
      flex-1 px-3 py-2
      rounded-md
      text-sm text-white
      bg-[#1e293b]
      placeholder-gray-400
      outline-none
      border border-transparent
      focus:border-blue-500
    "
              />
              <button
                onClick={sendChat}
                className="
      px-3 py-2
      rounded-md
      bg-blue-500
      text-white
      hover:bg-blue-600
      transition
    "
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>


     {OnlineOpen && (
  <div
  className={`
    fixed right-0 top-0 h-screen
    bg-[#17212B] text-white
    shadow-[-4px_0_12px_rgba(255,255,255,0.1)]
    transition-all duration-300 ease-in-out
    ${OnlineOpen ? "w-64" : "w-0 overflow-hidden"}
    flex flex-col
  `}
>
  {OnlineOpen && (
    <>
      {/* HEADER */}
      <div className="p-4 flex justify-between items-center bg-[#242F3D]">
        <h2 className="text-blue-400 font-bold">Online Users</h2>
        <button onClick={() => setOnlineOpen(false)}>
          <Minimize2 />
        </button>
      </div>

      {/* USERS LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {Object.values(allUsers).map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-3 bg-[#1e293b] p-2 rounded"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm">{user.name}</span>
          </div>
        ))}
      </div>
    </>
  )}
</div>

)}

      {/* OPEN CHAT BUTTON */}
      {!chatOpen && !OnlineOpen && (
        <div className="fixed top-4 right-4 flex items-center gap-2">
          {/* USER COUNT */}
          <h3
            onClick={() =>(setOnlineOpen(true))}
            className="
      flex items-center gap-1
      h-10
      text-white text-sm
      px-3 rounded
      bg-gray-800
      cursor-pointer
    "
          >
            <Users size={18} />
            <span>{Object.keys(allUsers).length}</span>
          </h3>

          {/* CHAT OPEN BUTTON */}
          <button
            onClick={() => setChatOpen(true)}
            className="
      h-10 w-10
      flex items-center justify-center
      bg-blue-500
      rounded
      text-white
      cursor-pointer
    "
          >
            <MessageCircleMore />
          </button>
        </div>
      )}
    </div>
  );
}
