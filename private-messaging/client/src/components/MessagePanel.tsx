import React, { useState } from "react";
import StatusIcon from "./StatusIcon";

interface Message {
  content: string;
  fromSelf: boolean;
}

interface User {
  userID: string;
  username: string;
  connected: boolean;
  messages: Message[];
  self: boolean;
  hasNewMessages: boolean;
}

interface MessagePanelProps {
  user: User;
  onInput: (content: string) => void;
  className: string;
}

const MessagePanel: React.FC<MessagePanelProps> = ({
  user,
  onInput,
  className,
}) => {
  const [input, setInput] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.length > 0) {
      onInput(input);
      setInput("");
    }
  };

  const displaySender = (message: Message, index: number) => {
    return (
      index === 0 || user.messages[index - 1].fromSelf !== message.fromSelf
    );
  };

  const isValid = input.length > 0;

  return (
    <div className={className}>
      <div className="header flex items-center px-4 py-2 border-b border-gray-300">
        <StatusIcon connected={user.connected} />
        <span className="ml-2">{user.username}</span>
      </div>

      <ul className="messages list-none p-4">
        {user.messages.map((message, index) => (
          <li key={index} className="message">
            {displaySender(message, index) && (
              <div className="sender font-bold mt-1">
                {message.fromSelf ? "(yourself)" : user.username}
              </div>
            )}
            {message.content}
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="form p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your message..."
          className="input w-4/5 p-2 resize-none rounded border"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="send-button bg-blue-500 text-white px-4 py-2 ml-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessagePanel;
