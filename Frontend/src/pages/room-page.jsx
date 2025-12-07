import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import WhiteBoard from "../whiteboard/WhiteBoard.jsx";
import { objectManager } from "../whiteboard/core/objectManager.js";
import { MessageCircleMore , Minimize2 , Send} from "lucide-react";

export default function RoomPage() {
  const { roomId } = useParams();
  const wsRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  // controls showing/hiding chat
  const [chatOpen, setChatOpen] = useState(true);



  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  useEffect(() => {
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
   <div className="h-screen w-screen flex flex-row relative overflow-hidden">
  
  {/* WHITEBOARD */}
  <div
    className="transition-all duration-300 flex-1"
    style={{ minWidth: 0 }}
  >
    <WhiteBoard wsRef={wsRef} />
  </div>

 {/* CHAT PANEL */}
<div
  className={`
    fixed right-0 top-0 h-full bg-[#17212B] text-white shadow-xl border-l border-[#2A3B4D]
    flex flex-col transition-all duration-300 ease-in-out
    ${chatOpen ? "w-80" : "w-0 overflow-hidden"}
  `}
>
  {/* HEADER */}
  {chatOpen && (
    <div className="flex items-center justify-between p-4 bg-[#242F3D] border-b border-[#2A3B4D]">
      <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CollabX Chat</h2>
      <button
        onClick={() => setChatOpen(false)}
        className="p-2 hover:bg-[#1E2B36] rounded cursor-pointer"
      >
        <Minimize2 className="w-5 h-5 text-gray-300" />
      </button>
    </div>
  )}

  {/* MESSAGES */}
  {chatOpen && (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
      {messages.map((m, i) => (
        <div
          key={i}
          className="max-w-[85%] bg-[#1E2B36] p-3 rounded-lg text-sm shadow-sm"
        >
          {m.text}
        </div>
      ))}

      {/* Dummy div for auto-scroll */}
      <div ref={messagesEndRef} />
    </div>
  )}

  {/* INPUT BAR */}
  {chatOpen && (
    <div className="p-4 bg-[#242F3D] border-t border-[#2A3B4D] flex items-center gap-3">
      
      <input
        className="flex-1 p-2 bg-[#0E1621] border border-[#2A3B4D] rounded-lg text-gray-200
        focus:outline-none focus:ring-2 focus:ring-[#2A9DF4]"
        placeholder="Type a message..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendChat()}
      />

      <button
        onClick={sendChat}
        className="p-2 bg-[#4d98d5] hover:bg-[#3279a9]  rounded-lg transition shadow-md"
      >
        <Send className="text-white" />
      </button>
    </div>
  )}
</div>

{/* OPEN CHAT BUTTON */}
{!chatOpen && (
  <button
    onClick={() => setChatOpen(true)}
    className="fixed right-4 top-4 z-50 bg-[#4d98d5] hover:bg-[#3279a9] cursor-pointer px-4 py-2 rounded-lg shadow-lg font-semibold text-white transition"
  >
    <MessageCircleMore />
  </button>



)}

    </div>
  );
}
