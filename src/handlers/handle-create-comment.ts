import * as github from "@actions/github";
import * as core from "@actions/core";
import { postThreadMessage } from "../slack";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { Reviewers } from "../types";
import { generateComment } from "./common/generate-comment";
import { SKIP_COMMENT_MARKER } from "../constants";

export async function handleCreateComment(
  octokit: any,
  event: any,
  reviewers: Reviewers
) {
  const { comment, issue } = event;
  const commentAuthorGithubName = comment.user.login;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = issue.number;

  if (comment.body.includes(SKIP_COMMENT_MARKER)) return;
  const ts = await findSlackTsInComments(octokit, prNumber, owner, repo);
  if (!ts) return;

  const commentAuthor = reviewers.reviewers.find(
    (rev) => rev.githubName === commentAuthorGithubName
  );
  const message = generateComment(commentAuthor?.name ?? "", comment.body);
  core.info("Message constructed:");
  core.debug(message);

  await postThreadMessage(ts, message);
}
