export type Question = {
	actionCode: number;
	checksum: number;
};

export type Answer = {
	actionCode: number;
	length: number;
	body: ArrayBuffer;
	checksum: number;
};

export function QuestionToBuffer(question: Question): ArrayBuffer {

	let size = 2;
	let buffer = new ArrayBuffer(size);
	let view = new DataView(buffer);
	view.setUint8(0, question.actionCode);
	question.checksum = 0;
	view.setUint8(1, question.checksum);
	return buffer;
};

export function BufferToQuestion(buffer: ArrayBuffer): Question {
	let view = new DataView(buffer);

	const question: Question = {
		actionCode: view.getUint8(0),
		checksum: view.getUint8(1)
	};
	return question;
}

export function AnswerToBuffer(answer: Answer): ArrayBuffer {
	let size = 10;
	size += answer.length;
	size += 4;
	let buffer = new ArrayBuffer(size);
	let view = new DataView(buffer);
	view.setUint8(0, answer.actionCode);
	view.setUint8(1, answer.length);
	answer.checksum = 0;
	for (let i = 0; i < answer.length; i++) {
		const bytes = new Uint8Array(answer.body);
		let byte = bytes.at(i);
		if (!byte) {
			continue;
		}
		view.setUint8(2 + i, byte);
		answer.checksum += byte;
		console.log(`Checksum: ${answer.checksum}`);
	}
	view.setUint32((2 + answer.length), answer.checksum);
	console.log(`Checksum in buffer: ${view.getUint32(2 + answer.length)}`);
	return buffer;
};

export function BufferToAnswer(buffer: ArrayBuffer): Answer {
	let view = new DataView(buffer);

	let answer: Answer = {
		actionCode: view.getUint8(0),
		length: view.getUint8(1),
		body: buffer.slice(2, view.getUint8(1) + 2),
		checksum: view.getUint32(2 + view.getUint8(1))
	};

	return answer;
};

console.log(BufferToQuestion(QuestionToBuffer({
	actionCode: 1,
	checksum: 0
})));