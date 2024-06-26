import * as core from "@actions/core";
import { getOctokit } from "@actions/github";
import { debug } from "../../utils";

const githubToken: string = core.getInput("github_token");

export async function findSlackTsInComments(
  prNumber: number,
  owner: string,
  repo: string
): Promise<string | null> {
  const octokit = getOctokit(githubToken);
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  for (const comment of comments.data) {
    if (!comment.body) continue;
    debug({ body: comment.body });
    const match = comment.body.match(/ts(\d+\.\d+)/);
    if (match) {
      return match[1].replace("ts", "");
    }
  }
  return null;
}
