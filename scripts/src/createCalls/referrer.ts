const REFERRER_URLS = [
	"https://www.google.com/search?q=url+shortener+analytics",
	"https://www.google.com/search?q=best+link+tracker",
	"https://www.bing.com/search?q=click+tracking",
	"https://duckduckgo.com/?q=utm+campaign+reporting",
	"https://www.reddit.com/r/webdev/",
	"https://news.ycombinator.com/",
	"https://www.linkedin.com/feed/",
	"https://www.facebook.com/",
	"https://twitter.com/home",
	"https://www.instagram.com/",
	"https://www.youtube.com/results?search_query=url+shortener",
	"https://medium.com/",
	"https://dev.to/",
	"https://github.com/",
	"https://www.notion.so/",
] as const;

const DIRECT_TRAFFIC_PROBABILITY = 0.25;

export const generatePlausibleReferrer = () => {
	if (Math.random() < DIRECT_TRAFFIC_PROBABILITY) {
		return undefined;
	}

	const index = Math.floor(Math.random() * REFERRER_URLS.length);
	return REFERRER_URLS[index];
};
