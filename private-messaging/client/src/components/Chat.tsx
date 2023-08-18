import React, { useState, useEffect } from "react";
import socket from "../lib/socket";
import User from "./User";
import MessagePanel from "./MessagePanel";

interface Message {
  content: string;
  fromSelf: boolean;
}

interface UserProps {
  userID: string;
  username: string;
  connected: boolean;
  messages: Message[];
  self: boolean;
  hasNewMessages: boolean;
}

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [users, setUsers] = useState<UserProps[]>([]);

  const onMessage = (content: string) => {
    if (selectedUser) {
      socket.emit("private message", {
        content,
        to: selectedUser.userID,
      });
      setSelectedUser((prevUser) => {
        if (prevUser) {
          prevUser.messages.push({
            content,
            fromSelf: true,
          });
        }
        return prevUser;
      });
    }
  };

  const onSelectUser = (user: UserProps) => {
    setSelectedUser(user);
    user.hasNewMessages = false;
  };

  useEffect(() => {
    socket.on("connect", () => {
      setUsers((prevUsers) => {
        return prevUsers.map((user) =>
          user.self ? { ...user, connected: true } : user
        );
      });
    });

    socket.on("disconnect", () => {
      setUsers((prevUsers) => {
        return prevUsers.map((user) =>
          user.self ? { ...user, connected: false } : user
        );
      });
    });

    const initReactiveProperties = (user: UserProps) => {
      user.hasNewMessages = false;
    };

    socket.on("users", (newUsers: UserProps[]) => {
      setUsers((prevUsers) => {
        const updatedUsers = newUsers.map((user: UserProps) => {
          const existingUser = prevUsers.find(
            (existingUser) => existingUser.userID === user.userID
          );

          if (existingUser) {
            // Update existing user's connected status and messages
            return {
              ...existingUser,
              connected: user.connected,
              messages: user.messages,
            };
          }

          user.self = user.userID === socket.userID;
          initReactiveProperties(user);
          return user;
        });

        const sortedUsers = [...updatedUsers].sort((a, b) => {
          if (a.self) return -1;
          if (b.self) return 1;
          if (a.username < b.username) return -1;
          return a.username > b.username ? 1 : 0;
        });

        return sortedUsers;
      });
    });

    socket.on("user connected", (user: UserProps) => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((prevUser) =>
          prevUser.userID === user.userID
            ? { ...prevUser, connected: true }
            : prevUser
        );

        const existingUser = updatedUsers.find(
          (existingUser) => existingUser.userID === user.userID
        );
        if (!existingUser) {
          initReactiveProperties(user);
          updatedUsers.push(user);
        }

        return updatedUsers;
      });
    });

    socket.on("user disconnected", (id: string) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userID === id ? { ...user, connected: false } : user
        )
      );
    });

    socket.on(
      "private message",
      ({ content, from, to }: Message & { from: string; to: string }) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            const fromSelf = socket.userID === from;
            if (user.userID === (fromSelf ? to : from)) {
              const updatedMessages = [...user.messages, { content, fromSelf }];
              const updatedUser = {
                ...user,
                messages: updatedMessages,
                hasNewMessages: user !== selectedUser,
              };
              return updatedUser;
            }
            return user;
          })
        );
      }
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("users");
      socket.off("user connected");
      socket.off("user disconnected");
      socket.off("private message");
    };
  }, [selectedUser, users]);

  return (
    <div className="flex">
      <div className="left-panel fixed left-0 top-0 bottom-0 w-64 overflow-x-hidden bg-purple-800 text-white">
        {users.map((user) => (
          <User
            key={user.userID}
            user={user}
            selected={selectedUser === user}
            onSelect={() => onSelectUser(user)}
          />
        ))}
      </div>
      {selectedUser && (
        <MessagePanel
          user={selectedUser}
          onInput={onMessage}
          className="right-panel ml-64"
        />
      )}
    </div>
  );
}
