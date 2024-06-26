# github codereview action

1. test action

- `act pull_request`

2. colima 사용하는 경우

- `sudo ln -s /Users/{username}/.colima/default/docker.sock /var/run/docker.sock`

3. event 지정

- `act pull_request --eventpath event.json`

4. 환경변수 지정

```sh
act pull_request --eventpath event.json \
  -s GITHUB_TOKEN=your_github_token \
  -s SLACK_TOKEN=your_slack_token \
  -s SLACK_CHANNEL=your_slack_channel \
  -s REVIEWERS_FILE=reviewers.yml
```
