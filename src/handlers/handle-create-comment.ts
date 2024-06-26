import * as github from "@actions/github";
import * as core from "@actions/core";
import { postThreadMessage } from "../slack";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { Reviewers } from "../types";
import { generateComment } from "./common/generate-comment";

export async function handleCreateComment(event: any, reviewers: Reviewers) {
  const { comment, issue } = event;
  const commentAuthorGithubName = comment.user.login;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = issue.number;

  // Find the existing Slack ts from comments
  const ts = await findSlackTsInComments(prNumber, owner, repo);
  if (!ts) return;

  const commentAuthor = reviewers.reviewers.find(
    (rev) => rev.githubName === commentAuthorGithubName
  );
  const message = generateComment(commentAuthor?.name ?? "", comment.body);
  core.info("Message constructed:");
  core.debug(message);

  await postThreadMessage(ts, message);
}
