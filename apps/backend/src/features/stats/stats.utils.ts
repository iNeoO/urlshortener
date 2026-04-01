export const toMinuteWindow = (date: Date) => {
	const ms = date.getTime();
	return new Date(Math.floor(ms / 60_000) * 60_000);
};
