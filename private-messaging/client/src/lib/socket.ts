import { io } from "socket.io-client";

const URL = "http://localhost:3000";
const socket: any = io(URL, { autoConnect: false }); //autoConnect is set to false so the connection is not established right away. We will manually call socket.connect() later, once the user has selected a username

//any event received by the client will be printed in the console
socket.onAny((event: any, ...args: any) => {
  console.log(event, args);
});

export default socket;
