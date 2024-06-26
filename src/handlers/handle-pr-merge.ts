import * as github from "@actions/github";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments.ts";
import { addReaction } from "../slack.ts";
import { debug } from "../utils.ts";

export async function handlePRMerge(event: any) {
  const { pull_request } = event;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = pull_request.number;

  const ts = await findSlackTsInComments(prNumber, owner, repo);
  debug({ ts });
  if (!ts) return;

  await addReaction(
    ts,
    process.env.SLACK_MERGE_EMOJI_NAME ?? "white_check_mark"
  );
}
