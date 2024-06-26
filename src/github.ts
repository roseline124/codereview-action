import * as core from "@actions/core";

const githubToken: string = core.getInput("github_token");
export async function getOctokit() {
  const { Octokit } = await import("@octokit/rest");
  return new Octokit({ auth: githubToken });
}
