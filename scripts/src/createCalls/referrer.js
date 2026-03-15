"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlausibleReferrer = void 0;
var REFERRER_URLS = [
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
];
var DIRECT_TRAFFIC_PROBABILITY = 0.25;
var generatePlausibleReferrer = function () {
    if (Math.random() < DIRECT_TRAFFIC_PROBABILITY) {
        return undefined;
    }
    var index = Math.floor(Math.random() * REFERRER_URLS.length);
    return REFERRER_URLS[index];
};
exports.generatePlausibleReferrer = generatePlausibleReferrer;
