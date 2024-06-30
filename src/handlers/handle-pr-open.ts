import * as core from "@actions/core";
import * as github from "@actions/github";
import i18n from "i18next";

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

  // send slack message
  const blocks = buildSlackBlock(reviewers, pull_request);
  const ts = await postMessage(blocks);

  debug({ ts, owner, repo, prNumber });

  // save the slack message ts as PR comment
  const prOpenComment = i18n.t("pr_open_comment");
  const slackMessageComment = `${prOpenComment}(https://${slackWorkspace}.slack.com/archives/${slackChannel}/p${ts?.replace(
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
  // set PR variables
  const prAuthor = pullRequest.user.login;
  const prTitle = pullRequest.title;
  const prDescription = pullRequest.body
    ? `\`\`\`${pullRequest.body}\`\`\``
    : "";
  const prLink = pullRequest.html_url;
  const repo = github.context.repo.repo;
  const prLabels: string | undefined = pullRequest.labels
    ?.map((label: { name: string }) => label.name)
    ?.join(", ");

  const prAuthorSlackId = reviewers.reviewers.find(
    (rev) => rev.githubName === prAuthor
  )?.slackId;
  const requestedReviewers = getReviewerSlackId(
    { pull_request: pullRequest },
    reviewers
  );

  const requester = `<@${prAuthorSlackId}>` || prAuthor;
  const requestReview = i18n.t("request_review", { requester });
  const requestReviewTo = i18n.t("request_review_to", {
    requester,
    reviewers: requestedReviewers,
  });
  debug({ requestReviewTo, requestReview });
  const blocks: any[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📮 ${requestedReviewers ? requestReviewTo : requestReview}*`,
      },
    },
  ];

  const emergencyLabelName = core.getInput("emergency_label_name");
  if (prLabels?.includes(emergencyLabelName)) {
    const emergentMessage = i18n.t("emergency");
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*🚨 \`${emergencyLabelName}\` ${emergentMessage}*`,
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

  if (pullRequest?.labels?.length) {
    blocks.push({
      type: "actions",
      elements: pullRequest.labels.map(({ name }: { name: string }) => ({
        type: "button",
        text: {
          type: "plain_text",
          text: name,
        },
        ...(name === emergencyLabelName ? { style: "danger" } : {}),
      })),
    });
  }

  debug({ blocks });

  return blocks;
}
