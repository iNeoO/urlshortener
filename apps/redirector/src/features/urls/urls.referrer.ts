const DIRECT_REFERRER = "direct";

const stripWwwPrefix = (hostname: string) => hostname.replace(/^www\./i, "");

export const normalizeReferrer = (referrer?: string | null) => {
	if (!referrer) {
		return DIRECT_REFERRER;
	}

	const value = referrer.trim();
	if (!value) {
		return DIRECT_REFERRER;
	}

	try {
		const url = new URL(value);
		if (!url.hostname) {
			return DIRECT_REFERRER;
		}
		return stripWwwPrefix(url.hostname.toLowerCase());
	} catch {
		return DIRECT_REFERRER;
	}
};
