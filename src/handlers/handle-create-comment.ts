import * as github from "@actions/github";
import * as core from "@actions/core";
import { postThreadMessage } from "../slack";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { Reviewers } from "../types";
import { generateComment } from "./common/generate-comment";
import { SKIP_COMMENT_MARKER } from "../constants";
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
