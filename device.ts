import { Socket } from "node:net";
import { Question, Answer, BufferToQuestion, AnswerToBuffer } from "./protocol";

export const Device = () => {
	const socket = new Socket();
	socket.connect({
		host: "localhost",
		port: 3000
	});
	socket.on("connect", () => {
		console.log(`Connected to the server.`);
		return;
	});

	socket.on("close", (hadError) => {
		if (hadError) {
			console.log(`An error occurred.`);
			return;
		}
		console.log(`Disconnected from the server.`);
		return;
	});

	socket.on("data", (req) => {
		const reqBuffer = req.buffer;
		let question: Question = BufferToQuestion(reqBuffer as ArrayBuffer);
		console.log(question);
		if (question.actionCode === 1) {
			let body: ArrayBuffer = new ArrayBuffer(4);
			let view = new DataView(body);
			view.setFloat32(0, 220.0256);
			socket.write(Buffer.from(AnswerToBuffer({
				actionCode: question.actionCode,
				length: 4,
				body,
				checksum: 0
			})));
		}
	});
};