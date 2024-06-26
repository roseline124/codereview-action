"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackClient = void 0;
exports.getSlackMessage = getSlackMessage;
exports.postMessage = postMessage;
exports.updateMessage = updateMessage;
exports.postThreadMessage = postThreadMessage;
exports.addReaction = addReaction;
exports.addCommentToPR = addCommentToPR;
const web_api_1 = require("@slack/web-api");
const slackToken = process.env.SLACK_TOKEN;
const slackChannel = process.env.SLACK_CHANNEL;
exports.slackClient = new web_api_1.WebClient(slackToken);
async function getSlackMessage(ts) {
    const result = await exports.slackClient.conversations.history({
        channel: slackChannel,
        latest: ts,
        limit: 1,
        inclusive: true,
    });
    if (result.messages && result.messages.length > 0) {
        return result.messages[0];
    }
    return null;
}
async function postMessage(blocks) {
    const res = await exports.slackClient.chat.postMessage({
        channel: slackChannel,
        blocks,
    });
    return res.ts;
}
async function updateMessage(ts, blocks) {
    await exports.slackClient.chat.update({
        channel: slackChannel,
        ts,
        blocks,
    });
}
async function postThreadMessage(ts, text) {
    await exports.slackClient.chat.postMessage({
        channel: slackChannel,
        text: text,
        thread_ts: ts,
    });
}
async function addReaction(ts, emoji) {
    await exports.slackClient.reactions.add({
        channel: slackChannel,
        name: emoji,
        timestamp: ts,
    });
}
async function addCommentToPR(octokit, prNumber, owner, repo, comment) {
    await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
    });
}
//# sourceMappingURL=slack.js.map