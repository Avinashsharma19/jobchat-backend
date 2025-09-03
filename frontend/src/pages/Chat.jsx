import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const token = sessionStorage.getItem("token");
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.emit("joinChat", chatId);

    socket.on("chatHistory", (msgs) => {
      setMessages(msgs);
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, token]); 

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !user || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      chatId,
      senderId: user.id,
      text,
    });

    setText("");
  };

  if (!user) {
    return <p className="text-center mt-4">Please login to continue.</p>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.sender?._id?.toString() === user?.id?.toString()
                ? "text-right"
                : ""
            }`}
          >
            <strong>{msg.sender?.name}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border p-2 rounded-l"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-r"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
