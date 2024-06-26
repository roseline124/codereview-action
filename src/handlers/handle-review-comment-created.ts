import * as core from "@actions/core";
import { Reviewers } from "../types";
import { addComment } from "./common/add-comment";

export async function handleReviewCommentCreated(
  octokit: any,
  event: any,
  reviewers: Reviewers
) {
  const { comment, pull_request } = event;

  const prNumber = pull_request.number;
  const owner = pull_request.base.repo.owner.login;
  const repo = pull_request.base.repo.name;

  core.info(`Owner: ${owner}`);
  core.info(`Repo: ${repo}`);
  core.info(`PR Number: ${prNumber}`);

  await addComment({ octokit, prNumber, owner, repo, reviewers, comment });
}
