import * as core from "@actions/core";
import { WebClient } from "@slack/web-api";

const slackToken: string = core.getInput("slack_token");
const slackChannel: string = core.getInput("slack_channel");

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
    text: "pr open message",
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
  if (!text.includes("![image](")) {
    return await slackClient.chat.postMessage({
      channel: slackChannel,
      text,
      thread_ts: ts,
    });
  }

  // support image
  await slackClient.chat.postMessage({
    channel: slackChannel,
    blocks: parseTextToBlocks(text),
    thread_ts: ts,
    text: "post thread message",
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

function parseTextToBlocks(text: string): any[] {
  const imgTagRegex = /!\[image\]\(([^)]+)\)/g;
  let match;
  const blocks: any[] = [];
  let lastIndex = 0;

  while ((match = imgTagRegex.exec(text)) !== null) {
    // Add text block before the image
    if (match.index > lastIndex) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: text.substring(lastIndex, match.index).trim(),
        },
      });
    }

    // Add image block
    blocks.push({
      type: "image",
      image_url: match[1],
      alt_text: "image",
    });

    lastIndex = imgTagRegex.lastIndex;
  }

  // Add remaining text block
  if (lastIndex < text.length) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: text.substring(lastIndex).trim(),
      },
    });
  }

  core.info(JSON.stringify(blocks));

  return blocks;
}
