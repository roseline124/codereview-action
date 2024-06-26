import * as core from "@actions/core";
import * as github from "@actions/github";

import { WebhookPayload } from "@actions/github/lib/interfaces.js";
import { addCommentToPR, postMessage } from "../slack";
import { Reviewers } from "../types";
import { debug } from "../utils";
import { getReviewerSlackId } from "./common/get-reviewer-slack-id";
import { SKIP_COMMENT_MARKER } from "../constants";

const slackChannel: string = core.getInput("slack_channel");
const slackWorkspace: string = core.getInput("slack_workspace");

export async function handlePROpen(
  octokit: any,
  event: WebhookPayload,
  reviewers: Reviewers
) {
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
  )})\n<!-- (ts${ts}) ${SKIP_COMMENT_MARKER} -->`;
  await addCommentToPR(
    octokit.rest,
    prNumber,
    owner,
    repo,
    slackMessageComment
  );
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

  const requestMessage = requestedReviewers
    ? `${requestedReviewers}님께 리뷰 요청을 보냈어요.`
    : "리뷰 요청을 보냈어요.";
  const blocks: any[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📮 ${
          `<@${prAuthorSlackId}>` || prAuthor
        }님이 ${requestMessage}*`,
      },
    },
  ];

  const emergencyLabelName = core.getInput("emergency_label_name");
  if (prLabels.includes(emergencyLabelName)) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*🚨 \`${emergencyLabelName}\` PR로 매우 긴급한 PR입니다! 지금 바로 리뷰에 참여해 주세요! 🚨*`,
      },
    });
  }

  blocks.push(
    ...[
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${repo}:*\n<${prLink}|${prTitle}>\n${prDescription}`,
        },
      },
    ]
  );

  if (prLabels?.length) {
    blocks.push({
      type: "actions",
      elements: prLabels.map(({ name }: { name: string }) => ({
        type: "button",
        text: {
          type: "plain_text",
          text: name,
        },
        ...(name === emergencyLabelName ? { style: "danger" } : {}),
      })),
    });
  }

  return blocks;
}
