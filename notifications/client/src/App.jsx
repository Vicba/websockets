import "./App.css";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [myId, setMyId] = useState(null); // [1
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const socket = io.connect("http://localhost:4000");

  useEffect(() => {
    socket.on("connect", () => {
      const user_id = uuidv4();
      setMyId(user_id); // 1]
      socket.emit("join", user_id);
      console.log("User joined: ", user_id);
    });

    socket.on("new_notification", (data) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { user_id: data.user_id, message: data.notification, read: false },
      ]);
    });

    socket.on("users_in_room", (users) => {
      setUsersInRoom(users);
      console.log("Users in room: ", users);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendNotification = () => {
    if (!selectedUser) {
      console.log("No user selected.");
      return;
    }

    if (selectedUser === myId) {
      window.alert("You can't send a notification to yourself.");
      return;
    }

    const message = prompt("Enter your notification:");
    if (message) {
      socket.emit("send_notification", {
        user_id: selectedUser,
        message,
      });
      console.log("Notification sent!");
    }
  };

  const setSelected = (user) => {
    setSelectedUser(user);
    console.log("Selected user: ", user);
  };

  const markNotificationAsRead = (index, notification) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index].read = true;
    setNotifications(updatedNotifications);
  };

  return (
    <div>
      <h1>Notifications</h1>
      <button onClick={sendNotification}>Send Notification</button>
      <div>
        {users.map((user) => (
          <div key={user.id} onClick={() => setSelectedUser(user)}>
            <p style={{ color: selectedUser === user.id ? "red" : "black" }}>
              {user.name}
            </p>
          </div>
        ))}
      </div>
      <div>
        <h2>Users in Room</h2>
        <ul>
          {usersInRoom.map((user) => (
            <li
              style={{
                cursor: "pointer",
                color: selectedUser === user.id ? "red" : "black",
              }}
              key={user.id}
              onClick={() => setSelected(user.id)}
            >
              {user.id === myId ? "Me" : user.id}
            </li>
          ))}
        </ul>
      </div>
      <div>
        {notifications.map((notification, index) => (
          <div
            key={index}
            style={{
              border: "1px solid black",
            }}
          >
            <p>{notification.message}</p>
            <p>Status: {notification.read ? "Read" : "Unread"}</p>
            <button
              onClick={() => markNotificationAsRead(index, notification)}
              disabled={notification.read === true}
            >
              Mark as read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
