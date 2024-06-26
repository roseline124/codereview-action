# github codereview action

## How to use

-

```yml
name: PR Slack Notification

on:
  pull_request:
    types: [opened, review_requested, closed]
  issue_comment:
    types: [created]
  pull_request_review:
    types: [submitted]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Notify Slack
        uses: roseline124/codereview-action@v1.0.0
        with:
          github_token: ${{ secrets.CODEREVIEWBOT_GITHUB_TOKEN }}
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel: slack channel id
          slack_workspace: slack workspace name
          emergency_label_name: codered # default: emergency
          slack_merge_emoji_name: check # default: white_check_mark
          reviewers_file: reviewers.yml # default: reviewers.yml in project root level
        env:
          ACTIONS_STEP_DEBUG: true
```

## reviewers.yml format

```
reviewers:
  - githubName: roseline124
    slackId: U07712R6TGS
    name: hyunjisong
  - githubName: c
    slackId: d
    name: leemonglyong
  - githubName: e
    slackId: f
    name: hongkildong
```

## test action

1. test action

- `act pull_request`

2. colima 사용하는 경우

- `sudo ln -s /Users/{username}/.colima/default/docker.sock /var/run/docker.sock`

3. event 지정

- pr open 이벤트: `act pull_request --eventpath event-open.json`
- pr review request 이벤트: `act pull_request --eventpath event-review-request.json`
- comment 이벤트: `act pull_request --eventpath event-comment.json`
- merge 이벤트: `act pull_request --eventpath event-merged.json`

## deploy

- `pnpm build`
- commit
- release
