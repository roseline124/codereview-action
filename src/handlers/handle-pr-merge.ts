import * as core from "@actions/core";
import * as github from "@actions/github";
import { findSlackTsInComments } from "./common/find-slack-ts-in-comments";
import { addReaction } from "../slack";
import { debug } from "../utils";

export async function handlePRMerge(event: any) {
  const { pull_request } = event;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = pull_request.number;

  const ts = await findSlackTsInComments(prNumber, owner, repo);
  debug({ ts });
  if (!ts) return;

  const slackMergeEmojiName: string = core.getInput("slack_merge_emoji_name");

  await addReaction(ts, slackMergeEmojiName);
}
