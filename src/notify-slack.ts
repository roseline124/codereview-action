import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";

import yaml from "js-yaml";
import { promises as fs } from "fs";
import { WebClient } from "@slack/web-api";
import { addCommentToPR, postMessage } from "./slack.ts";
import { WebhookPayload } from "@actions/github/lib/interfaces.js";
import { debug } from "./utils.ts";
import { Reviewers } from "./types.ts";
import { handlePROpen } from "./handlers/handle-pr-open.ts";
import { handleRequestReview } from "./handlers/handle-request-review.ts";

const githubToken = process.env.GITHUB_TOKEN as string;
const slackToken = process.env.SLACK_TOKEN as string;
const slackChannel = process.env.SLACK_CHANNEL as string;
const reviewersFilePath = process.env.REVIEWERS_FILE as string;
const slackWorkspace = process.env.SLACK_WORKSPACE as string;

const slackClient = new WebClient(slackToken);

async function notifySlack() {
  try {
    debug({ githubToken, slackToken, slackChannel, reviewersFilePath });

    core.info("Starting notifySlack function");

    const reviewersYaml = await fs.readFile(reviewersFilePath, "utf8");
    const reviewers = yaml.load(reviewersYaml) as Reviewers;
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
    }

    if (action === "review_requested" && pull_request) {
      return await handleRequestReview(event, reviewers);
    }

    if (action === "created" && comment) {
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
