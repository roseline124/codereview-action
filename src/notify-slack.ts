import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import yaml from "js-yaml";

const githubToken = process.env.GITHUB_TOKEN as string;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL as string;
const reviewersYaml = process.env.REVIEWERS as string;

const octokit = new Octokit({
  auth: githubToken,
});

interface GitHubEvent {
  action: string;
  pull_request?: {
    user: { login: string };
    requested_reviewers: { login: string }[];
    html_url: string;
  };
  comment?: {
    user: { login: string };
    body: string;
    html_url: string;
  };
  repository: {
    full_name: string;
  };
}

interface Reviewer {
  githubName: string;
  slackId: string;
  name: string;
}

interface Reviewers {
  reviewers: { [key: string]: Reviewer }[];
}

async function notifySlack() {
  const event: GitHubEvent = require(process.env.GITHUB_EVENT_PATH as string);
  const { action, pull_request, comment } = event;

  const reviewers: Reviewers = yaml.load(reviewersYaml) as Reviewers;

  let message = "";

  if ((action === "opened" || action === "review_requested") && pull_request) {
    const prAuthor = pull_request.user.login;
    const requestedReviewers = pull_request.requested_reviewers
      .map((r) => {
        const reviewer = Object.values(reviewers.reviewers).find(
          (rev) => rev.githubName === r.login
        );
        return reviewer ? reviewer.slackId : r.login;
      })
      .join(", ");

    const prLink = pull_request.html_url;
    message = `${prAuthor}님이 ${requestedReviewers}님께 리뷰 요청을 보냈어요. PR 링크: ${prLink}`;
  } else if (action === "created" && comment) {
    const commentAuthor = comment.user.login;
    const commentBody = comment.body;
    const prLink = comment.html_url;

    message = `@${commentAuthor}: "${commentBody}"\n댓글 링크: ${prLink}`;
  }

  if (message) {
    await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  }
}

notifySlack().catch((error) => {
  console.error(error);
  process.exit(1);
});
