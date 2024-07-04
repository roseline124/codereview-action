import * as github from "@actions/github";
import i18n from "i18next";

import { getSlackMessage, updateMessage } from "../slack";
import { Reviewers } from "../types";
import { debug } from "../utils";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { getReviewerSlackId } from "./common/get-reviewer-slack-id";

export async function handleRequestReview(
  octokit: any,
  event: any,
  reviewers: Reviewers
) {
  const { pull_request } = event;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = pull_request.number;

  const newReviewers = getReviewerSlackId(event, reviewers);

  const slackTs = await findSlackTsInComments(octokit, prNumber, owner, repo);
  if (!slackTs) return;
  const slackMessage = await getSlackMessage(slackTs);
  const blocks = slackMessage?.blocks ?? [];

  if (!blocks?.length) return;
  const textBlock = blocks.find(
    (block: any) => block.type === "section" && block.text?.type === "mrkdwn"
  );

  if (!textBlock?.text?.text) return;

  const prAuthorSlackId = reviewers.reviewers.find(
    (rev) => rev.githubName === pull_request.user?.login
  )?.slackId;
  textBlock.text.text = `*📮 ${i18n.t("request_review_to", {
    requester: prAuthorSlackId
      ? `<@${prAuthorSlackId}>`
      : pull_request.user?.login ?? "assignee",
    reviewers: newReviewers,
  })}*`;

  debug({ textBlock });
  const textBlockIndex = blocks.findIndex(
    (block: any) => block.type === "section" && block.text?.type === "mrkdwn"
  );
  blocks[textBlockIndex] = textBlock;
  await updateMessage(slackTs, blocks);
}
