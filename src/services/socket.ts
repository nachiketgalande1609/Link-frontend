import { io } from "socket.io-client";

const socket = io("http://192.168.31.142:5000");

export default socket;
