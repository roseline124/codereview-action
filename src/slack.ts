import { WebClient } from "@slack/web-api";

const slackToken = process.env.SLACK_TOKEN as string;
const slackChannel = process.env.SLACK_CHANNEL as string;

export const slackClient = new WebClient(slackToken);

export async function getSlackMessage(ts: string) {
  const result = await slackClient.conversations.history({
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

export async function postMessage(blocks: any) {
  const res = await slackClient.chat.postMessage({
    channel: slackChannel,
    blocks,
  });
  return res.ts;
}

export async function updateMessage(ts: string, blocks: any) {
  await slackClient.chat.update({
    channel: slackChannel,
    ts,
    blocks,
  });
}

export async function postThreadMessage(ts: string, text: string) {
  await slackClient.chat.postMessage({
    channel: slackChannel,
    text: text,
    thread_ts: ts,
  });
}

export async function addReaction(ts: string, emoji: string) {
  await slackClient.reactions.add({
    channel: slackChannel,
    name: emoji,
    timestamp: ts,
  });
}

export async function addCommentToPR(
  octokit: any,
  prNumber: number,
  owner: string,
  repo: string,
  comment: string
) {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: comment,
  });
}
