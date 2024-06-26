import * as github from "@actions/github";
import { getSlackMessage, updateMessage } from "../slack";
import { Reviewers } from "../types";
import { debug } from "../utils";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { getReviewerSlackId } from "./common/get-reviewer-slack-id";

export async function handleRequestReview(event: any, reviewers: Reviewers) {
  const { pull_request } = event;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = pull_request.number;

  const newReviewers = getReviewerSlackId(event, reviewers);

  const slackTs = await findSlackTsInComments(prNumber, owner, repo);
  if (!slackTs) return;
  const slackMessage = await getSlackMessage(slackTs);
  const blocks = slackMessage?.blocks ?? [];

  if (!blocks?.length) return;
  const textBlock = blocks.find(
    (block: any) => block.type === "section" && block.text?.type === "mrkdwn"
  );

  if (!textBlock?.text?.text) return;
  const existingReviewersMatch = textBlock.text.text.match(/님이.+님께/);

  if (!existingReviewersMatch) return;
  const existingReviewers = existingReviewersMatch[0]
    .replace(/님이|님께/g, "")
    .trim();
  textBlock.text.text = textBlock.text.text.replace(
    existingReviewersMatch[0],
    `님이 ${existingReviewers}, ${newReviewers}님께`
  );
  debug({ slackTs, textBlock });
  const textBlockIndex = blocks.findIndex(
    (block: any) => block.type === "section" && block.text?.type === "mrkdwn"
  );
  blocks[textBlockIndex] = textBlock;
  await updateMessage(slackTs, blocks);
}
