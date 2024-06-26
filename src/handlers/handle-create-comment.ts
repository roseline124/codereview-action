import * as github from "@actions/github";
import * as core from "@actions/core";
import { postThreadMessage } from "../slack";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { Reviewers } from "../types";

/**
 * @TODO 코드리뷰로 한꺼번에 제출해도 코멘트 달리는지 확인
 */
export async function handleCreateComment(event: any, reviewers: Reviewers) {
  const { comment, pull_request, issue } = event;
  const commentAuthorGithubName = comment.user.login;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = pull_request.number;

  core.info(
    `comment number: ${comment.id}, issue number: ${issue?.number}, pr number: ${pull_request.number}`
  );
  // GitHub Actions의 GITHUB_TOKEN으로 작성된 코멘트 제외
  if (commentAuthorGithubName === "github-actions[bot]") {
    core.info("Skipping comment created by GitHub Actions bot.");
    return;
  }

  // Find the existing Slack ts from comments
  const ts = await findSlackTsInComments(prNumber, owner, repo);
  if (!ts) return;

  const commentAuthor = reviewers.reviewers.find(
    (rev) => rev.githubName === commentAuthorGithubName
  );
  const message = `💬 ${commentAuthor?.name}: "${comment.body}"`;
  core.info("Message constructed:");
  core.debug(message);

  await postThreadMessage(ts, message);
}
