import { Octokit } from "@octokit/rest";
import { WebClient } from "@slack/web-api";

const slackToken = process.env.SLACK_TOKEN as string;
const slackChannel = process.env.SLACK_CHANNEL as string;

export const slackClient = new WebClient(slackToken);

export async function postMessage(text: string) {
  const res = await slackClient.chat.postMessage({
    channel: slackChannel,
    text: text,
  });
  return res.ts;
}

export async function updateMessage(ts: string, text: string) {
  await slackClient.chat.update({
    channel: slackChannel,
    ts: ts,
    text: text,
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
  octokit: Octokit,
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
