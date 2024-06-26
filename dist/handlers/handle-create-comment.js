"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateComment = handleCreateComment;
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const slack_ts_1 = require("../slack.ts");
const find_slack_ts_in_comments_ts_1 = require("./common/find-slack-ts-in-comments.ts");
/**
 * @TODO 코드리뷰로 한꺼번에 제출해도 코멘트 달리는지 확인
 */
async function handleCreateComment(event, reviewers) {
    const { comment, issue } = event;
    const commentAuthorGithubName = comment.user.login;
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const prNumber = issue.pull_request.number;
    // GitHub Actions의 GITHUB_TOKEN으로 작성된 코멘트 제외
    if (commentAuthorGithubName === "github-actions[bot]") {
        core.info("Skipping comment created by GitHub Actions bot.");
        return;
    }
    // Find the existing Slack ts from comments
    const ts = await (0, find_slack_ts_in_comments_ts_1.findSlackTsInComments)(prNumber, owner, repo);
    if (!ts)
        return;
    const commentAuthor = reviewers.reviewers.find((rev) => rev.githubName === commentAuthorGithubName);
    const message = `💬 ${commentAuthor?.name}: "${comment.body}"`;
    core.info("Message constructed:");
    core.debug(message);
    await (0, slack_ts_1.postThreadMessage)(ts, message);
}
//# sourceMappingURL=handle-create-comment.js.map