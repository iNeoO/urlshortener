const FROM = 1767218400000; // 2026-01-01T00:00:00.000Z

export const toBase62 = (value: string | number | bigint): string => {
	const chars =
		"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let result = "";
	let num = BigInt(value);
	do {
		const rem = Number(num % 62n);
		result = chars[rem] + result;
		num = num / 62n;
	} while (num > 0n);
	return result;
};

class IdGenerator {
	private timeStamp: number;
	private counter: number;
	private from: number;

	constructor(from: number = FROM) {
		this.from = from;
		this.timeStamp = Date.now() - from;
		this.counter = 0;
	}

	generateId() {
		const now = Date.now() - this.from;
		if (now === this.timeStamp) {
			this.counter += 1;
		} else {
			this.timeStamp = now;
			this.counter = 0;
		}
		const timePart = `${this.timeStamp}`;
		const counterPart = `${this.counter}`.padStart(2, "0");
		return `${timePart}${counterPart}`;
	}
}

export const idGenerator = new IdGenerator();
