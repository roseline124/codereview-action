import * as github from "@actions/github";

import { WebhookPayload } from "@actions/github/lib/interfaces.js";
import { octokit } from "../github.ts";
import { addCommentToPR, postMessage } from "../slack.ts";
import { Reviewers } from "../types.ts";
import { debug } from "../utils.ts";
import { getReviewerSlackId } from "./get-reviewer-slack-id.ts";

export async function handlePROpen(
  event: WebhookPayload,
  reviewers: Reviewers
) {
  const slackChannel = process.env.SLACK_CHANNEL as string;
  const slackWorkspace = process.env.SLACK_WORKSPACE as string;
  const { pull_request } = event;
  if (!pull_request) return;

  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = pull_request.number;

  // slack message 전송
  const blocks = buildSlackBlock(reviewers, pull_request);
  const ts = await postMessage(blocks);

  debug({ ts, owner, repo, prNumber });

  // PR에 슬랙 메시지 ts 저장
  const slackMessageComment = `코드리뷰 요청이 슬랙메시지로 전달되었어요: [슬랙 메시지 바로가기](https://${slackWorkspace}.slack.com/archives/${slackChannel}/p${ts?.replace(
    ".",
    ""
  )})\n<!-- (ts${ts}) -->`;
  await addCommentToPR(octokit, prNumber, owner, repo, slackMessageComment);
}

interface BuildSlackBlockParams {
  reviewers: Reviewers;
  pullRequest: any;
}
function buildSlackBlock(reviewers: Reviewers, pullRequest: any) {
  // PR 변수 셋업
  const prAuthor = pullRequest.user.login;
  const prTitle = pullRequest.title;
  const prDescription = pullRequest.body
    ? `\`\`\`${pullRequest.body}\`\`\``
    : "";
  const prLink = pullRequest.html_url;
  const repo = github.context.repo.repo;
  const prLabels = pullRequest.labels
    ?.map((label: { name: string }) => label.name)
    .join(", ");

  const prAuthorSlackId = reviewers.reviewers.find(
    (rev) => rev.githubName === prAuthor
  )?.slackId;
  const requestedReviewers = getReviewerSlackId(
    { pull_request: pullRequest },
    reviewers
  );

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📮 ${
          `<@${prAuthorSlackId}>` || prAuthor
        }님이 ${requestedReviewers}님께 리뷰 요청을 보냈어요.*\n*${repo}:*\n<${prLink}|${prTitle}>\n${prDescription}\n`,
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
