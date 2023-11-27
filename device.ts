import { Socket } from "node:net";

const socket = new Socket();

socket.connect({
	host: "localhost",
	port: 3000
});

socket.on("connect", () => {

});
socket.on("data", (data) => {

});
socket.on("close", () => {

});
socket.on("end", () => {

});