"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCalls = void 0;
var node_process_1 = require("node:process");
var libs_1 = require("@urlshortener/infra/libs");
var fetchRedirection_js_1 = require("./createCalls/fetchRedirection.js");
var abortController = new AbortController();
var intervalId;
var logger = libs_1.pinoLogger.child({ script: "createCalls" });
var createCalls = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        intervalId = setInterval(function () {
            var calls = [];
            var count = Math.random() * 10;
            for (var i = 0; i < count; i++) {
                calls.push((0, fetchRedirection_js_1.fetchRedirection)(url, abortController));
            }
            Promise.all(calls);
        }, 500);
        return [2 /*return*/];
    });
}); };
exports.createCalls = createCalls;
var gracefulShutdown = function (signal) {
    logger.info("Received ".concat(signal, ". Shutting down gracefully..."));
    abortController.abort();
    clearInterval(intervalId);
    node_process_1.default.exit(0);
};
node_process_1.default.on("SIGTERM", function () { return gracefulShutdown("SIGTERM"); });
node_process_1.default.on("SIGINT", function () { return gracefulShutdown("SIGINT"); });
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var url;
    return __generator(this, function (_a) {
        url = node_process_1.default.argv[2];
        if (!url) {
            console.error("Please provide a URL as an argument");
            node_process_1.default.exit(1);
        }
        libs_1.loggerStorage.run(libs_1.pinoLogger, function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.info("Starting to create calls to ".concat(url));
                        return [4 /*yield*/, (0, exports.createCalls)(url)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
main();
