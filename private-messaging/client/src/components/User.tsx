import React from "react";
import StatusIcon from "./StatusIcon";

interface UserProps {
  user: {
    username: string;
    self: boolean;
    connected: boolean;
    hasNewMessages: boolean;
  };
  selected: boolean;
  onSelect: () => void;
}

const User: React.FC<UserProps> = ({ user, selected, onSelect }) => {
  const onClick = () => {
    onSelect();
  };

  const status = user.connected ? "online" : "offline";

  return (
    <div
      className={`user p-2 ${selected ? "selected bg-blue-600" : ""}`}
      onClick={onClick}
    >
      <div className="description inline-block">
        <div className="name">
          {user.username} {user.self ? " (yourself)" : ""}
        </div>
        <div className="status">
          <StatusIcon connected={user.connected} /> {status}
        </div>
      </div>
      {user.hasNewMessages && (
        <div className="new-messages bg-red-500 text-white rounded-full w-6 h-6 text-center float-right mt-3">
          !
        </div>
      )}
    </div>
  );
};

export default User;
