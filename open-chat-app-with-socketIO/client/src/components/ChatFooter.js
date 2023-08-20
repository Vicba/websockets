import React, { useState, useRef } from "react";

const ChatFooter = ({ socket }) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    socket.emit("typing", `${localStorage.getItem("userName")} is typing...`);
  };

  const handleNotTyping = () => {
    socket.emit("typing", "");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && localStorage.getItem("userName")) {
      socket.emit("message", {
        text: message,
        name: localStorage.getItem("userName"),
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
      });
    }
    setMessage("");
    handleNotTyping();
  };

  const handleOnChange = (e) => {
    setMessage(e.target.value);
    clearTimeout(typingTimeoutRef.current);
    handleTyping();
    typingTimeoutRef.current = setTimeout(handleNotTyping, 1000);
  };

  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={handleOnChange}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;
