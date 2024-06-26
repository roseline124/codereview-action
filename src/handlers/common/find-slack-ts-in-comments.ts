import { octokit } from "../../github.ts";
import { debug } from "../../utils.ts";

export async function findSlackTsInComments(
  prNumber: number,
  owner: string,
  repo: string
): Promise<string | null> {
  const comments = await octokit.issues.listComments({
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
