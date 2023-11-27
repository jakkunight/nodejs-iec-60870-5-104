export type FieldSchema = { // The schema of a generic field.
	name: string; // Associates the fieldname with its length in bytes.
	length: number;
	primitive: "string" | "signedInt" | "unsignedInt" | "float" | "bool" // Uses a PRIMITIVE datatype (bool, number, string).
};

export type HeadSchema = FieldSchema[]; // Everything is a list of fields.
export type BodySchema = FieldSchema[];
export type TailSchema = FieldSchema[];

export type MessageSchema = { // A message in object form.
	[key: string]: unknown
};

export type MessageStruct = { // The message structure.
	head: HeadSchema; // The HEAD contains the most important information about how to interpret the Message and the BODY.
	body?: BodySchema; // The BODY contains the message information itself. It's optional, if the HEAD is enough to understand the message.
	tail?: TailSchema; // The TAIL just contains a check or indicates the end of the message. It can be optional.
};

export type MessageBuffer = ArrayBuffer; // The message in binary form. ArrayBuffer is used for compatibility with Web Browsers instead of Node's Buffer.

export class Message {
	struct: MessageStruct = {
		head: []
	};
	buffer: MessageBuffer = new ArrayBuffer(0);
	schema: MessageSchema = {};

	constructor({
		struct,
		buffer,
		schema
	}: {
		struct: MessageStruct,
		buffer?: MessageBuffer,
		schema?: MessageSchema
	}) {
		this.struct = struct;

		// Don't convert anything:
		if (schema && buffer) {
			this.buffer = buffer;
			this.schema = schema;
			return;
		}

		// Conversion from object to buffer:
		if (schema) {
			this.schema = schema;
			let pointer = 0;
			let size = 0;
			let flatStruct = Object.values(struct).flat(2);
			flatStruct.forEach(({ length }) => {
				size += length;
			});
			this.buffer = new ArrayBuffer(size);
			let view = new DataView(this.buffer);
			flatStruct.forEach(({ name, length, primitive }) => {
				if (primitive === "unsignedInt" || primitive === "bool") {
					if (length === 1) {
						view.setUint8(pointer, Number(this.schema[name]));
					}
					if (length === 2) {
						view.setUint16(pointer, Number(this.schema[name]));
					}
					if (length === 4) {
						view.setUint32(pointer, Number(this.schema[name]));
					}
					if (length === 8) {
						view.setBigUint64(pointer, BigInt(Number(this.schema[name])));
					}
				}
				if (primitive === "signedInt") {
					if (length === 1) {
						view.setInt8(pointer, Number(this.schema[name]));
					}
					if (length === 2) {
						view.setInt16(pointer, Number(this.schema[name]));
					}
					if (length === 4) {
						view.setInt32(pointer, Number(this.schema[name]));
					}
					if (length === 8) {
						view.setBigInt64(pointer, BigInt(Number(this.schema[name])));
					}
				}
				if (primitive === "bool") {
					view.setUint8(pointer, Number(this.schema[name]));
				}
				if (primitive === "float") {
					if (length === 4) {
						view.setFloat32(pointer, Number(this.schema[name]));
					}
					if (length === 8) {
						view.setFloat64(pointer, Number(this.schema[name]));
					}
				}
				if (primitive === "string") {
					for (let i = 0; i < length; i++) {
						view.setUint8(pointer + i, (this.schema[name] as string).charCodeAt(i));
					}
				}
				pointer += length;
			});
			return;
		}

		// Conversion from buffer to object:
		if (buffer) {
			this.buffer = buffer;
			let pointer = 0;
			let flatStruct = Object.values(struct).flat(2);
			let view = new DataView(this.buffer);
			flatStruct.forEach(({ name, length, primitive }) => {
				if (primitive === "bool") {
					this.schema[name] = Boolean(view.getUint8(pointer));
				}
				if (primitive === "unsignedInt") {
					if (length === 1) {
						this.schema[name] = view.getUint8(pointer);
					}
					if (length === 2) {
						this.schema[name] = view.getUint16(pointer);
					}
					if (length === 4) {
						this.schema[name] = view.getUint32(pointer);
					}
					if (length === 8) {
						this.schema[name] = view.getBigUint64(pointer);
					}
				}
				if (primitive === "signedInt") {
					if (length === 1) {
						this.schema[name] = view.getInt8(pointer);
					}
					if (length === 2) {
						this.schema[name] = view.getInt16(pointer);
					}
					if (length === 4) {
						this.schema[name] = view.getInt32(pointer);
					}
					if (length === 8) {
						this.schema[name] = view.getBigInt64(pointer);
					}
				}
				if (primitive === "float") {
					if (length === 4) {
						this.schema[name] = view.getFloat32(pointer);
					}
					if (length === 8) {
						this.schema[name] = view.getFloat64(pointer);
					}
				}
				if (primitive === "string") {
					let codes: string[] = [];
					for (let i = 0; i < length; i++) {
						codes.push(String.fromCharCode(view.getUint8(pointer + i)));
					}
					this.schema[name] = codes.join("");
				}
				pointer += length;
			});
		}
		if (!buffer && !schema) {
			throw new Error("An object or a buffer must be provided to create a message.");
		}
	}
};
