import * as core from "@actions/core";
import * as github from "@actions/github";
import fetch from "node-fetch";
import yaml from "js-yaml";
import { promises as fs } from "fs";
import { WebClient } from "@slack/web-api";

const debug = (json: Record<string, any>) => {
  core.debug(JSON.stringify(json, null, 2));
};
async function openPR() {
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

    if (action === "opened" && pull_request) {
      const prAuthor = pull_request.user.login;
      core.info(`Pull request author: ${prAuthor}`);

      const requestedReviewers = pull_request.requested_reviewers
        .map((r: any) => {
          const reviewer = reviewers.reviewers.find(
            (rev) => rev.githubName === r.login
          );
          return reviewer ? reviewer.slackId : r.login;
        })
        .join(", ");

      const prLink = pull_request.html_url;
      message = `${prAuthor}님이 ${requestedReviewers}님께 리뷰 요청을 보냈어요. PR 링크: ${prLink}`;
      core.info("Message constructed:");
      core.debug(message);
    } else if (action === "review_requested" && pull_request) {
      const prAuthor = pull_request.user.login;
      core.info(`Pull request author: ${prAuthor}`);
      core.debug("Requested reviewers:");
      debug(pull_request.requested_reviewers);

      const requestedReviewers = pull_request.requested_reviewers
        .map((r: any) => {
          const reviewer = reviewers.reviewers.find(
            (rev) => rev.githubName === r.login
          );
          return reviewer ? reviewer.slackId : r.login;
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
