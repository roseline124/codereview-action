import { Reviewers } from "../../types.ts";

export function getReviewerSlackId(event: any, reviewers: Reviewers): string {
  const { pull_request } = event;
  return pull_request.requested_reviewers
    .map((r: any) => {
      const reviewer = reviewers.reviewers.find(
        (rev) => rev.githubName === r.login
      );
      return reviewer ? `<@${reviewer.slackId}>` : r.login;
    })
    .join(", ");
}
