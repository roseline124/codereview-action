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
exports.handleRequestReview = handleRequestReview;
const github = __importStar(require("@actions/github"));
const slack_ts_1 = require("../slack.ts");
const utils_ts_1 = require("../utils.ts");
const find_slack_ts_in_comments_ts_1 = require("./common/find-slack-ts-in-comments.ts");
const get_reviewer_slack_id_ts_1 = require("./common/get-reviewer-slack-id.ts");
async function handleRequestReview(event, reviewers) {
    const { pull_request } = event;
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const prNumber = pull_request.number;
    const newReviewers = (0, get_reviewer_slack_id_ts_1.getReviewerSlackId)(event, reviewers);
    const slackTs = await (0, find_slack_ts_in_comments_ts_1.findSlackTsInComments)(prNumber, owner, repo);
    if (!slackTs)
        return;
    const slackMessage = await (0, slack_ts_1.getSlackMessage)(slackTs);
    const blocks = slackMessage?.blocks ?? [];
    if (!blocks?.length)
        return;
    const textBlock = blocks.find((block) => block.type === "section" && block.text?.type === "mrkdwn");
    if (!textBlock?.text?.text)
        return;
    const existingReviewersMatch = textBlock.text.text.match(/님이.+님께/);
    if (!existingReviewersMatch)
        return;
    const existingReviewers = existingReviewersMatch[0]
        .replace(/님이|님께/g, "")
        .trim();
    textBlock.text.text = textBlock.text.text.replace(existingReviewersMatch[0], `님이 ${existingReviewers}, ${newReviewers}님께`);
    (0, utils_ts_1.debug)({ slackTs, textBlock });
    const textBlockIndex = blocks.findIndex((block) => block.type === "section" && block.text?.type === "mrkdwn");
    blocks[textBlockIndex] = textBlock;
    await (0, slack_ts_1.updateMessage)(slackTs, blocks);
}
//# sourceMappingURL=handle-request-review.js.map