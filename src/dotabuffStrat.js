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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.HeroStats = exports.GameStats = void 0;
var playwright_1 = require("playwright");
var GameStats = /** @class */ (function () {
    function GameStats(allHeroData) {
        this.allHeroData = allHeroData;
        this.wonCount = 0;
        this.lostCount = 0;
        this.unknownCount = 0;
        this.calculateCounts();
    }
    GameStats.prototype.calculateCounts = function () {
        for (var _i = 0, _a = this.allHeroData; _i < _a.length; _i++) {
            var _b = _a[_i], skillBase = _b[2];
            if (skillBase === 'won') {
                this.wonCount++;
            }
            else if (skillBase === 'lost') {
                this.lostCount++;
            }
            else {
                this.unknownCount++;
            }
        }
    };
    GameStats.prototype.getWonCount = function () {
        return this.wonCount;
    };
    GameStats.prototype.getLostCount = function () {
        return this.lostCount;
    };
    GameStats.prototype.getUnknownCount = function () {
        return this.unknownCount;
    };
    return GameStats;
}());
exports.GameStats = GameStats;
var HeroStats = /** @class */ (function () {
    function HeroStats(allHeroData) {
        this.allHeroData = allHeroData;
        this.heroCounts = {};
        this.calculateHeroCounts();
    }
    HeroStats.prototype.calculateHeroCounts = function () {
        for (var _i = 0, _a = this.allHeroData; _i < _a.length; _i++) {
            var _b = _a[_i], heroName = _b[0], result = _b[1], skillBase = _b[2];
            if (heroName) {
                if (!this.heroCounts[heroName]) {
                    this.heroCounts[heroName] = { won: 0, lost: 0, total: 0 };
                }
                this.heroCounts[heroName].total++;
                if (result === 'Won Match' || skillBase === 'won') {
                    this.heroCounts[heroName].won++;
                }
                else if (result === 'Lost Match' || skillBase === 'lost') {
                    this.heroCounts[heroName].lost++;
                }
            }
        }
    };
    HeroStats.prototype.getHeroCounts = function () {
        return this.heroCounts;
    };
    return HeroStats;
}());
exports.HeroStats = HeroStats;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, allHeroData, pageNumber, rows, _i, rows_1, row, _a, heroName, result, skillBase, gameStats, heroStats, sortedHeroCounts, _b, sortedHeroCounts_1, _c, heroName, counts, won, lost, total;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, playwright_1.chromium.launch({
                    headless: process.env.CI === 'true' ||
                        ['1', 'true', 'yes'].indexOf(String(process.env.HEADLESS || '').toLowerCase()) !== -1
                })];
            case 1:
                browser = _d.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _d.sent();
                allHeroData = [];
                pageNumber = 1;
                _d.label = 3;
            case 3:
                if (!(pageNumber <= 2)) return [3 /*break*/, 11];
                // Navigate to the Dotabuff matches overview page for the specified player
                return [4 /*yield*/, page.goto("https://www.dotabuff.com/players/97758803/matches?enhance=overview&page=".concat(pageNumber))];
            case 4:
                // Navigate to the Dotabuff matches overview page for the specified player
                _d.sent();
                // Wait for the page to load completely
                return [4 /*yield*/, page.waitForLoadState('networkidle')];
            case 5:
                // Wait for the page to load completely
                _d.sent();
                return [4 /*yield*/, page.$$('tbody > tr:not(:first-child)')];
            case 6:
                rows = _d.sent();
                _i = 0, rows_1 = rows;
                _d.label = 7;
            case 7:
                if (!(_i < rows_1.length)) return [3 /*break*/, 10];
                row = rows_1[_i];
                return [4 /*yield*/, row.evaluate(function (row) {
                        var _a, _b;
                        var heroName = (_a = row.querySelector('.cell-large a')) === null || _a === void 0 ? void 0 : _a.textContent;
                        var result = (_b = row.querySelector('.cell-large div.subtext')) === null || _b === void 0 ? void 0 : _b.textContent;
                        var winElement = row.querySelector('.won');
                        var loseElement = row.querySelector('.lost');
                        var skillBase;
                        if (winElement) {
                            skillBase = 'won';
                        }
                        else if (loseElement) {
                            skillBase = 'lost';
                        }
                        else {
                            skillBase = 'unknown';
                        }
                        return [heroName, result, skillBase];
                    })];
            case 8:
                _a = _d.sent(), heroName = _a[0], result = _a[1], skillBase = _a[2];
                allHeroData.push([heroName || '', result || '', skillBase]);
                _d.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 7];
            case 10:
                pageNumber++;
                return [3 /*break*/, 3];
            case 11:
                gameStats = new GameStats(allHeroData);
                console.log('\n ################################# \n');
                console.log('Number of won registers:', gameStats.getWonCount());
                console.log('Number of lost registers:', gameStats.getLostCount());
                console.log('Number of unknown registers:', gameStats.getUnknownCount());
                console.log('\n ################################# \n');
                heroStats = new HeroStats(allHeroData);
                console.log('Hero Counts:');
                sortedHeroCounts = Object.entries(heroStats.getHeroCounts()).sort(function (a, b) { return b[1].total - a[1].total; });
                for (_b = 0, sortedHeroCounts_1 = sortedHeroCounts; _b < sortedHeroCounts_1.length; _b++) {
                    _c = sortedHeroCounts_1[_b], heroName = _c[0], counts = _c[1];
                    won = counts.won, lost = counts.lost, total = counts.total;
                    console.log("".concat(heroName, ": ").concat(total, " games (Won: ").concat(won, ", Lost: ").concat(lost, ")"));
                }
                // Close the browser
                return [4 /*yield*/, browser.close()];
            case 12:
                // Close the browser
                _d.sent();
                return [2 /*return*/];
        }
    });
}); })();
