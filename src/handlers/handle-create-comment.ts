import * as github from "@actions/github";
import { SKIP_COMMENT_MARKER } from "../constants";
import { Reviewers } from "../types";
import { addComment } from "./common/add-comment";

export async function handleCreateComment(
  octokit: any,
  event: any,
  reviewers: Reviewers
) {
  const { comment, issue } = event;

  const prNumber = issue.number;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  if (comment.body.includes(SKIP_COMMENT_MARKER)) return;
  await addComment({ octokit, prNumber, owner, repo, reviewers, comment });
}
