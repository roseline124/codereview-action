import * as core from "@actions/core";
import * as github from "@actions/github";
import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";

import yaml from "js-yaml";
import { promises as fs } from "fs";
import { WebClient } from "@slack/web-api";
import { addCommentToPR, postMessage } from "./slack";
import { WebhookPayload } from "@actions/github/lib/interfaces";

const githubToken = process.env.GITHUB_TOKEN as string;
const slackToken = process.env.SLACK_TOKEN as string;
const slackChannel = process.env.SLACK_CHANNEL as string;
const reviewersFilePath = process.env.REVIEWERS_FILE as string;

console.log({ githubToken, slackToken, slackChannel, reviewersFilePath });
const slackClient = new WebClient(slackToken);
const octokit = new Octokit({ auth: githubToken });

interface Reviewer {
  githubName: string;
  slackId: string;
  name: string;
}

interface Reviewers {
  reviewers: Reviewer[];
}

const debug = (json: Record<string, any>) => {
  core.debug(JSON.stringify(json, null, 2));
};
async function notifySlack() {
  try {
    debug({ githubToken, slackToken, slackChannel, reviewersFilePath });

    core.info("Starting notifySlack function");

    const reviewersYaml = await fs.readFile(reviewersFilePath, "utf8");
    const reviewers: Reviewers = yaml.load(reviewersYaml) as Reviewers;
    core.info("Reviewers loaded:");
    debug(reviewers);

    const event = github.context.payload;
    core.info("Event loaded:");
    debug(event);
    const { action, pull_request, comment } = event;

    let message = "";
    let ts = "";

    if (action === "opened" && pull_request) {
      return await handlePROpen(event, reviewers);
    } else if (action === "review_requested" && pull_request) {
      const prAuthor = pull_request.user.login;
      core.info(`Pull request author: ${prAuthor}`);

      const requestedReviewers = pull_request.requested_reviewers
        .map((r: any) => {
          const reviewer = reviewers.reviewers.find(
            (rev) => rev.githubName === r.login
          );
          return reviewer ? `<@${reviewer.slackId}>` : r.login;
        })
        .join(", ");

      const prLink = pull_request.html_url;
      message = `${prAuthor}님이 ${requestedReviewers}님께 리뷰 요청을 보냈어요. PR 링크: ${prLink}`;
      core.info("Message constructed:");
      core.debug(message);
    } else if (action === "created" && comment) {
      const commentAuthor = comment.user.login;
      const commentBody = comment.body;
      const prLink = comment.html_url;

      message = `@${commentAuthor}: "${commentBody}"\n댓글 링크: ${prLink}`;
      core.info("Message constructed:");
      core.debug(message);
    }

    if (message) {
      core.info("Sending message to Slack:");
      core.debug(message);

      const response = await slackClient.chat.postMessage({
        channel: slackChannel,
        text: message,
      });

      response.ts;

      // response.message?.thread_ts; // slack id

      core.info("Message sent to Slack");
      debug(response);
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

async function handlePROpen(event: WebhookPayload, reviewers: Reviewers) {
  const { pull_request } = event;
  if (!pull_request) return;

  const prAuthor = pull_request.user.login;
  core.info(`Pull request author: ${prAuthor}`);

  const requestedReviewers = pull_request.requested_reviewers
    .map((r: any) => {
      const reviewer = reviewers.reviewers.find(
        (rev) => rev.githubName === r.login
      );
      return reviewer ? `<@${reviewer.slackId}>` : r.login;
    })
    .join(", ");

  const prLink = pull_request.html_url;
  const message = `${prAuthor}님이 ${requestedReviewers}님께 리뷰 요청을 보냈어요. PR 링크: ${prLink}`;
  core.info("Message constructed:");
  core.debug(message);

  const ts = await postMessage(message);

  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = pull_request.number;
  const slackMessageComment = `Slack message timestamp: ${ts}`;
  await addCommentToPR(octokit, prNumber, owner, repo, slackMessageComment);
}
