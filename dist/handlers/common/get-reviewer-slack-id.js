"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewerSlackId = getReviewerSlackId;
function getReviewerSlackId(event, reviewers) {
    const { pull_request } = event;
    return pull_request.requested_reviewers
        .map((r) => {
        const reviewer = reviewers.reviewers.find((rev) => rev.githubName === r.login);
        return reviewer ? `<@${reviewer.slackId}>` : r.login;
    })
        .join(", ");
}
//# sourceMappingURL=get-reviewer-slack-id.js.map