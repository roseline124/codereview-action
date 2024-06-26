import * as core from "@actions/core";
import { Reviewers } from "../../types";
import { findSlackTsInComments } from "./find-slack-ts-in-comments";
import { generateComment } from "./generate-comment";
import { postThreadMessage } from "../../slack";

interface AddCommentParams {
  octokit: any;
  prNumber: number;
  owner: string;
  repo: string;
  reviewers: Reviewers;
  comment: any;
}
export async function addComment({
  octokit,
  owner,
  prNumber,
  repo,
  reviewers,
  comment,
}: AddCommentParams) {
  const ts = await findSlackTsInComments(octokit, prNumber, owner, repo);
  if (!ts) return;

  const commentAuthor = reviewers.reviewers.find(
    (rev) => rev.githubName === comment.user.login
  );
  const message = generateComment(
    commentAuthor?.name ?? comment.user.login,
    comment.body
  );
  core.info("Message constructed:");
  core.debug(message);

  await postThreadMessage(ts, message);
}
