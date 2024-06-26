# github codereview action

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
