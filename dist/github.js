"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.octokit = void 0;
const rest_1 = require("@octokit/rest");
const githubToken = process.env.GITHUB_TOKEN;
exports.octokit = new rest_1.Octokit({ auth: githubToken });
//# sourceMappingURL=github.js.map