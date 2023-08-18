import { useRef, useState, useEffect } from "react";
import socket from "./lib/socket";
import Chat from "./components/Chat";

export default function App() {
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");

    if (sessionID) {
      setUsernameAlreadySelected(true);
      socket.auth = { sessionID };
      socket.connect();
    }

    const sessionHandler = ({
      sessionID,
      userID,
    }: {
      sessionID: string;
      userID: string;
    }) => {
      socket.auth = { sessionID };
      localStorage.setItem("sessionID", sessionID);
      socket.userID = userID;
    };

    socket.on("session", sessionHandler);

    const connectErrorHandler = (err: { message: string }) => {
      if (err.message === "invalid username") {
        setUsernameAlreadySelected(false);
      }
    };

    socket.on("connect_error", connectErrorHandler);

    return () => {
      socket.off("session", sessionHandler);
      socket.off("connect_error", connectErrorHandler);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameAlreadySelected(true);
    socket.auth = { username: usernameRef.current?.value };
    socket.connect();
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {!usernameAlreadySelected ? (
        <div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              ref={usernameRef}
              className="border-2"
              required
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <Chat />
      )}
    </div>
  );
}
