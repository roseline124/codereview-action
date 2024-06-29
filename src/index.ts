import * as core from "@actions/core";
import * as github from "@actions/github";

import { promises as fs } from "fs";
import yaml from "js-yaml";
import { handleCreateComment } from "./handlers/handle-create-comment";
import { handlePRMerge } from "./handlers/handle-pr-merge";
import { handlePROpen } from "./handlers/handle-pr-open";
import { handleRequestReview } from "./handlers/handle-request-review";
import { Reviewers } from "./types";
import { debug } from "./utils";
import { handleReviewSubmitted } from "./handlers/handle-review-submitted";
import { getOctokit } from "./github";
import { handleReviewCommentCreated } from "./handlers/handle-review-comment-created";

const reviewersFilePath: string = core.getInput("reviewers_file");

async function notifySlack() {
  try {
    const octokit = await getOctokit();
    core.info("Starting notifySlack function");

    const reviewersYaml = await fs.readFile(reviewersFilePath, "utf8");
    const reviewers = yaml.load(reviewersYaml) as Reviewers;
    debug(reviewers);

    const event = github.context.payload;
    core.info(`Event loaded: ${JSON.stringify(event)}`);
    debug(event);
    const { action, pull_request, comment, review } = event;

    // PR 오픈 시 메시지 생성
    if (action === "opened" && pull_request) {
      return await handlePROpen(octokit, event, reviewers);
    }

    // 리뷰어 추가 시 기존 메시지의 리뷰어 업데이트
    if (action === "review_requested" && pull_request) {
      return await handleRequestReview(octokit, event, reviewers);
    }

    // 코멘트 생성 시 스레드에 달기
    if (action === "created" && comment) {
      return await handleCreateComment(octokit, event, reviewers);
    }

    if (
      action === "created" &&
      github.context.eventName === "pull_request_review_comment"
    ) {
      return await handleReviewCommentCreated(octokit, event, reviewers);
    }

    // 리뷰를 통해 코멘트 제출하는 경우데도 스레드에 메시지 달기
    if (action === "submitted" && review) {
      return await handleReviewSubmitted(octokit, event, reviewers);
    }

    if (action === "closed") {
      const isMerged = !!pull_request?.merged_at;
      if (isMerged) core.info("Event merged");
      await handlePRMerge(octokit, event, isMerged);
    }
  } catch (error: any) {
    core.error("Error in notifySlack function:");
    core.error(error.message);
    process.exit(1);
  }
}

notifySlack().catch((error) => {
  core.error("Error caught in notifySlack:");
  core.error(error.message);
  process.exit(1);
});
