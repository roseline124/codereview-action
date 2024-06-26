# github codereview action

1. test action

- `act pull_request`

2. colima 사용하는 경우

- `sudo ln -s /Users/{username}/.colima/default/docker.sock /var/run/docker.sock`

3. event 지정

- pr open 이벤트: `act pull_request --eventpath event-open.json`
- pr review request 이벤트: `act pull_request --eventpath event-review-request.json`
