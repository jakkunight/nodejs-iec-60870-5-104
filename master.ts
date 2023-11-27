import { Server, Socket } from "node:net";
import { Message } from "./message";

const server = new Server();
let connections: {
	[address: string]: Socket
} = {};

server.listen({
	exclusive: true,
	host: "localhost",
	port: 3000
});

server.on("connection", (socket) => {
	const socketInfo = `${socket.remoteAddress}:${socket.remotePort}`;
	if (!connections[socketInfo]) {
		connections[socketInfo] = socket;
	}
	socket.on("data", (data) => {
		const dataBuffer = (data.buffer as ArrayBuffer);
		const message = new Message({
			struct: {
				head: [
					{
						length: 4,
						name: "number",
						primitive: "signedInt"
					}
				]
			},
			buffer: dataBuffer
		});
		console.log(message.schema);
	});
	socket.on("close", () => {

	});
	socket.on("end", () => {

	});
});