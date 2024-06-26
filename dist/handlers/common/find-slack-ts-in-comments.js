"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSlackTsInComments = findSlackTsInComments;
const github_ts_1 = require("../../github.ts");
const utils_ts_1 = require("../../utils.ts");
async function findSlackTsInComments(prNumber, owner, repo) {
    const comments = await github_ts_1.octokit.issues.listComments({
        owner,
        repo,
        issue_number: prNumber,
    });
    for (const comment of comments.data) {
        if (!comment.body)
            continue;
        (0, utils_ts_1.debug)({ body: comment.body });
        const match = comment.body.match(/ts(\d+\.\d+)/);
        if (match) {
            return match[1].replace("ts", "");
        }
    }
    return null;
}
//# sourceMappingURL=find-slack-ts-in-comments.js.map