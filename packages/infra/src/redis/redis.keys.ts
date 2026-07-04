export const createRedisKeyGenerator = (prefix: string) => ({
	groups: (userId: string) => `${prefix}user:${userId}:groups`,
	url: (short: string) => `${prefix}url:${short}`,
	clickCount: (bucket: string) => `${prefix}url_clicks:${bucket}:clickCount`,
	clickCountLock: (bucket: string) =>
		`${prefix}url_clicks:${bucket}:clickCount:lock`,
	browser: (id: string, bucket: string) =>
		`${prefix}url_clicks:${id}:${bucket}:browsers`,
	browserLock: (id: string, bucket: string) =>
		`${prefix}url_clicks:${id}:${bucket}:browsers:lock`,
	os: (id: string, bucket: string) => `${prefix}url_clicks:${id}:${bucket}:os`,
	osLock: (id: string, bucket: string) =>
		`${prefix}url_clicks:${id}:${bucket}:os:lock`,
	device: (id: string, bucket: string) =>
		`${prefix}url_clicks:${id}:${bucket}:devices`,
	deviceLock: (id: string, bucket: string) =>
		`${prefix}url_clicks:${id}:${bucket}:devices:lock`,
	referrer: (id: string, bucket: string) =>
		`${prefix}url_clicks:${id}:${bucket}:referrers`,
	referrerLock: (id: string, bucket: string) =>
		`${prefix}url_clicks:${id}:${bucket}:referrers:lock`,
});

export type RedisKeyGenerator = ReturnType<typeof createRedisKeyGenerator>;
