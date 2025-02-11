import { io } from "socket.io-client";

const socket = io("http://192.168.1.4:5000");

export default socket;
