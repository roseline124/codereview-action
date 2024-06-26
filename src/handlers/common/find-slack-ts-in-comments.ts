import * as core from "@actions/core";
import { debug } from "../../utils";

export async function findSlackTsInComments(
  octokit: any,
  prNumber: number,
  owner: string,
  repo: string
): Promise<string | null> {
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  for (const comment of comments.data) {
    if (!comment.body) continue;
    core.info(`comment.body: ${comment.body}`);
    debug({ body: comment.body });
    const match = comment.body.match(/ts(\d+\.\d+)/);
    if (match) {
      const ts = match[1].replace("ts", "");
      core.info(`ts: ${ts}`);
      return ts;
    }
  }
  return null;
}
