export const toMinuteWindow = (date: Date) => {
	const ms = date.getTime();
	return new Date(Math.floor(ms / 60_000) * 60_000);
};

export const toHourWindow = (date: Date) => {
	const d = new Date(date);
	d.setUTCMinutes(0, 0, 0);
	return d;
};

export const toDayWindow = (date: Date) => {
	const d = new Date(date);
	d.setUTCHours(0, 0, 0, 0);
	return d;
};
