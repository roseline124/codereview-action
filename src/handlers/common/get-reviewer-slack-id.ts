import { Reviewers } from "../../types";

export function getReviewerSlackId(event: any, reviewers: Reviewers): string {
  const { pull_request } = event;
  if (!pull_request.requested_reviewers?.length) return "";
  return pull_request.requested_reviewers
    .map((r: any) => {
      const reviewer = reviewers.reviewers.find(
        (rev) => rev.githubName === r.login
      );
      return reviewer ? `<@${reviewer.slackId}>` : r.login;
    })
    .join(", ");
}
