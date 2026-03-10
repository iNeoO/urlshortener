export const getGroupsKey = (userId: string) => `user:${userId}:groups`;
export const getUrlKey = (short: string) => `url:${short}`;
export const getClickCountKey = (bucket: string) =>
	`url_clicks:${bucket}:clickCount`;
export const getClickCountLockKey = (bucket: string) =>
	`url_clicks:${bucket}:clickCount:lock`;
export const getBrowserKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:browsers`;
export const getBrowserLockKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:browsers:lock`;
export const getOsKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:os`;
export const getOsLockKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:os:lock`;
export const getDeviceKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:devices`;
export const getDeviceLockKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:devices:lock`;
export const getReferrerKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:referrers`;
export const getReferrerLockKey = (id: string, bucket: string) =>
	`url_clicks:${id}:${bucket}:referrers:lock`;
