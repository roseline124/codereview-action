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
exports.handlePROpen = handlePROpen;
const github = __importStar(require("@actions/github"));
const github_ts_1 = require("../github.ts");
const slack_ts_1 = require("../slack.ts");
const utils_ts_1 = require("../utils.ts");
const get_reviewer_slack_id_ts_1 = require("./common/get-reviewer-slack-id.ts");
async function handlePROpen(event, reviewers) {
    const slackChannel = process.env.SLACK_CHANNEL;
    const slackWorkspace = process.env.SLACK_WORKSPACE;
    const { pull_request } = event;
    if (!pull_request)
        return;
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const prNumber = pull_request.number;
    // slack message 전송
    const blocks = buildSlackBlock(reviewers, pull_request);
    const ts = await (0, slack_ts_1.postMessage)(blocks);
    (0, utils_ts_1.debug)({ ts, owner, repo, prNumber });
    // PR에 슬랙 메시지 ts 저장
    const slackMessageComment = `코드리뷰 요청이 슬랙메시지로 전달되었어요: [슬랙 메시지 바로가기](https://${slackWorkspace}.slack.com/archives/${slackChannel}/p${ts?.replace(".", "")})\n<!-- (ts${ts}) -->`;
    await (0, slack_ts_1.addCommentToPR)(github_ts_1.octokit, prNumber, owner, repo, slackMessageComment);
}
function buildSlackBlock(reviewers, pullRequest) {
    // PR 변수 셋업
    const prAuthor = pullRequest.user.login;
    const prTitle = pullRequest.title;
    const prDescription = pullRequest.body
        ? `\`\`\`${pullRequest.body}\`\`\``
        : "";
    const prLink = pullRequest.html_url;
    const repo = github.context.repo.repo;
    const prLabels = pullRequest.labels
        ?.map((label) => label.name)
        .join(", ");
    const prAuthorSlackId = reviewers.reviewers.find((rev) => rev.githubName === prAuthor)?.slackId;
    const requestedReviewers = (0, get_reviewer_slack_id_ts_1.getReviewerSlackId)({ pull_request: pullRequest }, reviewers);
    const blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*📮 ${`<@${prAuthorSlackId}>` || prAuthor}님이 ${requestedReviewers}님께 리뷰 요청을 보냈어요.*\n*${repo}:*\n<${prLink}|${prTitle}>\n${prDescription}\n`,
            },
        },
    ];
    if (prLabels?.length) {
        blocks.push({
            type: "context",
            // @ts-ignore
            elements: [{ type: "mrkdwn", text: `*labels:* ${prLabels}` }],
        });
    }
    return blocks;
}
//# sourceMappingURL=handle-pr-open.js.map