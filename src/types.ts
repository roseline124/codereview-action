export interface Reviewer {
  githubName: string;
  slackId: string;
  name: string;
}

export interface Reviewers {
  reviewers: Reviewer[];
}
