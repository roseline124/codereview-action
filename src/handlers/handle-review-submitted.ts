import * as core from "@actions/core";
import * as github from "@actions/github";
import i18n from "i18next";
import { Reviewers } from "../types";
import { postThreadMessage } from "../slack";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { generateComment } from "./common/generate-comment";
import { debug } from "../utils";

export async function handleReviewSubmitted(
  octokit: any,
  event: any,
  reviewers: Reviewers
) {
  const { review, pull_request } = event;

  const prNumber = pull_request.number;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const ts = await findSlackTsInComments(octokit, prNumber, owner, repo);
  if (!ts) return;

  const reviewComments = await listReviewComments(
    octokit,
    owner,
    repo,
    prNumber
  );

  const submittedReviewComments = reviewComments.filter(
    (comment: any) => comment.pull_request_review_id === review.id
  );

  debug({ reviewComments });
  core.info(
    `submittedReviewComments.length: ${submittedReviewComments.length}`
  );

  /**
   * I could combine the comments into one,
   * but Slack messages don't have a character limit.
   * So I send them one by one
   */
  for (const comment of submittedReviewComments) {
    if (!comment.body) continue;
    const commentAuthor = reviewers.reviewers.find(
      (rev) => rev.githubName === comment.user?.login
    );
    const message = generateComment(
      commentAuthor?.name ?? comment.user?.login ?? "bot",
      comment.body
    );
    core.info("Message constructed:");
    core.debug(message);

    await postThreadMessage(ts, message);
  }

  let lastMessage: string = "";
  const commentAuthor = reviewers.reviewers.find(
    (rev) => rev.githubName === review.user?.login
  );

  const commentAuthorName = commentAuthor?.name ?? review.user?.login ?? "bot";
  const assignee = reviewers.reviewers.find(
    (rev) => rev.githubName === pull_request.user?.login
  );
  const assigneeMention = assignee ? `\n<@${assignee.slackId}>` : "";
  if (review.state === "approved") {
    lastMessage = generateComment(
      commentAuthorName,
      ":white_check_mark: LGTM\n" + (review.body ?? "") + assigneeMention
    );
  } else if (review.state === "changes_requested") {
    const requestChangeMessage = i18n.t("request_changes");
    lastMessage = generateComment(
      commentAuthorName,
      `:pray: ${requestChangeMessage}\n` + (review.body ?? "") + assigneeMention
    );
  } else {
    if (review.body) {
      lastMessage = generateComment(
        commentAuthorName,
        review.body + assigneeMention
      );
    }
  }

  await postThreadMessage(ts, lastMessage);
}

export async function listReviewComments(
  octokit: any,
  owner: string,
  repo: string,
  prNumber: number
) {
  const response = await octokit.rest.pulls.listReviewComments({
    owner,
    repo,
    pull_number: prNumber,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch review comments: ${response.status}`);
  }

  return response.data;
}
