export type DeviceType = "mobile" | "tablet" | "desktop" | "bot";

export type ParsedUserAgent = {
	browserFamily: string;
	browserVersion: string;
	osFamily: string;
	osVersion: string;
	deviceType: DeviceType;
};

const UNKNOWN = "Unknown";
const UNKNOWN_VERSION = "0";

const sanitizeVersion = (version?: string) => {
	if (!version) {
		return UNKNOWN_VERSION;
	}
	const clean = version.replace(/_/g, ".").trim();
	return clean.length > 0 ? clean : UNKNOWN_VERSION;
};

const formatDimension = (family: string, version: string) =>
	`${family}:${version}`;

const getWindowsVersion = (ua: string) => {
	const match = ua.match(/windows nt ([\d.]+)/i);
	if (!match?.[1]) return UNKNOWN_VERSION;
	const nt = match[1];
	if (nt.startsWith("10.0")) return "10";
	if (nt.startsWith("6.3")) return "8.1";
	if (nt.startsWith("6.2")) return "8";
	if (nt.startsWith("6.1")) return "7";
	return nt;
};

const parseBrowser = (ua: string) => {
	const checks: Array<[RegExp, string]> = [
		[/edg(?:e|ios|a)?\/([\d.]+)/i, "Edge"],
		[/opr\/([\d.]+)/i, "Opera"],
		[/samsungbrowser\/([\d.]+)/i, "Samsung Internet"],
		[/firefox\/([\d.]+)/i, "Firefox"],
		[/fxios\/([\d.]+)/i, "Firefox"],
		[/crios\/([\d.]+)/i, "Chrome"],
		[/chrome\/([\d.]+)/i, "Chrome"],
		[/version\/([\d.]+).*safari/i, "Safari"],
		[/safari\/([\d.]+)/i, "Safari"],
		[/msie ([\d.]+)/i, "IE"],
		[/trident\/.*rv:([\d.]+)/i, "IE"],
	];

	for (const [regex, family] of checks) {
		const match = ua.match(regex);
		if (match?.[1]) {
			return { family, version: sanitizeVersion(match[1]) };
		}
	}

	return { family: UNKNOWN, version: UNKNOWN_VERSION };
};

const parseOs = (ua: string) => {
	if (/android/i.test(ua)) {
		const match = ua.match(/android ([\d.]+)/i);
		return { family: "Android", version: sanitizeVersion(match?.[1]) };
	}

	if (/(iphone|ipad|ipod)/i.test(ua)) {
		const match = ua.match(/(?:iphone os|cpu os|cpu iphone os) ([\d_]+)/i);
		return { family: "iOS", version: sanitizeVersion(match?.[1]) };
	}

	if (/windows nt/i.test(ua)) {
		return { family: "Windows", version: getWindowsVersion(ua) };
	}

	if (/mac os x/i.test(ua)) {
		const match = ua.match(/mac os x ([\d_]+)/i);
		return { family: "macOS", version: sanitizeVersion(match?.[1]) };
	}

	if (/cros/i.test(ua)) {
		const match = ua.match(/cros [^\s]+ ([\d.]+)/i);
		return { family: "ChromeOS", version: sanitizeVersion(match?.[1]) };
	}

	if (/linux/i.test(ua)) {
		return { family: "Linux", version: UNKNOWN_VERSION };
	}

	return { family: UNKNOWN, version: UNKNOWN_VERSION };
};

const parseDeviceType = (ua: string) => {
	if (/bot|crawler|spider|slurp|preview|headless/i.test(ua)) {
		return "bot" as const;
	}
	if (/tablet|ipad|playbook|silk/i.test(ua)) {
		return "tablet" as const;
	}
	if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
		return "mobile" as const;
	}
	if (/android/i.test(ua)) {
		return "tablet" as const;
	}
	return "desktop" as const;
};

export const parseUserAgent = (userAgent: string): ParsedUserAgent => {
	const ua = userAgent.trim();
	if (!ua) {
		return {
			browserFamily: UNKNOWN,
			browserVersion: UNKNOWN_VERSION,
			osFamily: UNKNOWN,
			osVersion: UNKNOWN_VERSION,
			deviceType: "desktop",
		};
	}

	const browser = parseBrowser(ua);
	const os = parseOs(ua);
	const deviceType = parseDeviceType(ua);

	return {
		browserFamily: browser.family,
		browserVersion: browser.version,
		osFamily: os.family,
		osVersion: os.version,
		deviceType,
	};
};

export const toBrowserDimension = (ua: ParsedUserAgent) =>
	formatDimension(ua.browserFamily, ua.browserVersion);

export const toOsDimension = (ua: ParsedUserAgent) =>
	formatDimension(ua.osFamily, ua.osVersion);
