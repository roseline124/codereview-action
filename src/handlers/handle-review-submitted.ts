import * as core from "@actions/core";
import * as github from "@actions/github";
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

  // 코멘트를 하나로 합쳐서 보낼 수 있지만 슬랙 메시지에 글자 수 제한이 없어서 하나씩 나눠 보냄.
  for (const comment of submittedReviewComments) {
    if (!comment.body) continue;
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

  if (!review.body) return;
  let lastMessage: string = "";
  const commentAuthor = reviewers.reviewers.find(
    (rev) => rev.githubName === review.user.login
  );

  if (review.state === "approved") {
    lastMessage = generateComment(
      commentAuthor?.name ?? review.user.login,
      ":white_check_mark: LGTM\n" + review.body
    );
  } else if (review.state === "changes_requested") {
    lastMessage = generateComment(
      commentAuthor?.name ?? review.user.login,
      ":pray: 재수정 부탁드려요!\n" + review.body
    );
  } else {
    lastMessage = generateComment(
      commentAuthor?.name ?? review.user.login,
      review.body
    );
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
