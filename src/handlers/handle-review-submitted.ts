import * as core from "@actions/core";
import * as github from "@actions/github";
import { Reviewers } from "../types";
import { postThreadMessage } from "../slack";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { generateComment } from "./common/generate-comment";

export async function handleReviewSubmitted(event: any, reviewers: Reviewers) {
  const { review, pull_request, comment } = event;

  const prNumber = pull_request.number;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  const ts = await findSlackTsInComments(prNumber, owner, repo);
  if (!ts) return;

  const commentAuthor = reviewers.reviewers.find(
    (rev) => rev.githubName === review.user.login
  );
  const message = generateComment(commentAuthor?.name ?? "", comment.body);
  core.info("Message constructed:");
  core.debug(message);

  await postThreadMessage(ts, message);
}
