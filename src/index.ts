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
import { initI18n } from "./i18n";

const reviewersFilePath: string = core.getInput("reviewers_file");

async function notifySlack() {
  try {
    await initI18n();
    const octokit = await getOctokit();
    core.info("Starting notifySlack function");

    const reviewersYaml = await fs.readFile(reviewersFilePath, "utf8");
    const reviewers = yaml.load(reviewersYaml) as Reviewers;
    debug(reviewers);

    const event = github.context.payload;
    core.info(`Event loaded: ${JSON.stringify(event)}`);
    debug(event);
    const { action, pull_request, comment, review } = event;

    // create slack message when pr opened
    if (action === "opened" && pull_request) {
      return await handlePROpen(octokit, event, reviewers);
    }

    // update existing slack message when reviewers added
    if (action === "review_requested" && pull_request) {
      return await handleRequestReview(octokit, event, reviewers);
    }

    // comment on slack thread when github comment created
    if (action === "created" && comment) {
      return await handleCreateComment(octokit, event, reviewers);
    }

    // handle pull request review comment
    if (
      action === "created" &&
      github.context.eventName === "pull_request_review_comment"
    ) {
      return await handleReviewCommentCreated(octokit, event, reviewers);
    }

    // comment on slack thread when github review created
    if (action === "submitted" && review) {
      return await handleReviewSubmitted(octokit, event, reviewers);
    }

    // add emojis to slack message when pr closed or merged
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
