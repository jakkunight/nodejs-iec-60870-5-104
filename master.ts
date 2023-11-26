import { Server, Socket } from "node:net";
import { Question, Answer, BufferToAnswer, QuestionToBuffer } from "./protocol";

export function Master() {
	const server = new Server();
	let connections: { [address: string]: Socket } = {};

	server.listen({
		exclusive: true,
		port: 3000,
		host: "localhost"
	}, () => {
		console.log(`Server at ${server.address()?.toString()}`);
		setInterval(() => {
			let conns = Object.values(connections);
			conns.forEach((conn) => {
				conn.write(Buffer.from(QuestionToBuffer({
					actionCode: 1,
					checksum: 0
				})));
			});
		}, 3 * 1000);
	});

	server.on("connection", (socket) => {
		const address = `${socket.remoteAddress}:${socket.remotePort}`;
		if (!connections[address]) {
			connections[address] = socket;
			console.log(`New connection added! (${address})`);
		}

		socket.on("close", (hadError) => {
			delete connections[address];
			console.log(`Connection with ${address} was closed ${hadError ? "due to an error" : ""}.`);
		});

		socket.on("error", () => {
			delete connections[address];
			console.log(`Connection with ${address} was closed due to an error.`);
		});

		socket.on("data", (data) => {
			console.log(data);
			const dataBuffer = data.buffer as ArrayBuffer;
			let answer: Answer = BufferToAnswer(dataBuffer);
			console.log(answer);
		});
	});

	server.on("close", () => {
		console.log(`Something went wrong...`);
	});
};