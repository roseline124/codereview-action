# PR Codereview Slack Notification Action

웹훅 서버 없이 깃헙 액션으로 PR 리뷰를 슬랙 채널에서 관리하세요!
워크플로우만 추가해주면 됩니다. :)

![Preview Image](images/preview.png)

## Features

1. PR 오픈 시 설정한 채널로 PR 리뷰 알림이 갑니다.

- "@리뷰요청자님이 @리뷰어님께 리뷰 요청을 보냈어요"
- repo, pr title(pr link), pr description, label 정보가 함께 전송됩니다.

2. 리뷰어를 추가하면 PR 오픈 메시지에 함께 멘션됩니다.

3. PR 오픈 시에 emergency 라벨을 달면 '긴급' 메시지가 함께 보입니다.

- 라벨 이름 커스텀 가능합니다.

4. 코멘트를 달면 PR 오픈 메시지에 스레드로 댓글이 달립니다.

5. PR review submit 시 스레드에 댓글이 달립니다.

- comment: 코멘트로 달립니다.
- approve: LGTM 메시지와 함께 달립니다.
- request change: request change 메시지와 함께 달립니다.

6. PR close 시에 이모지가 달립니다.

- close: x 이모지 (커스텀 가능)
- merge: white_check_mark 이모지 (커스텀 가능)

## How to use

1. 회사나 단체의 슬랙 앱을 만들고 해당 슬랙 앱을 원하는 채널에 추가해주세요.

그리고 `OAuth & Permissions`에서 `channels:history`, `chat:write`, `chat:write.public`, `groups:history`, `reactions:write` 이 권한들을 추가해주세요.

2. `.github/workflows` 폴더 안에 `pr-slack-notifiy.yml` 파일을 만들어주세요.

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
        uses: roseline124/codereview-action
        with:
          github_token: ${{ secrets.CODEREVIEWBOT_GITHUB_TOKEN }}
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel: <SLACK_CHANNEL_ID>
          slack_workspace: <SLACK_WORKSPACE_NAME>
```

3. 프로젝트 루트 레벨에 `reviewers.yml` 파일을 만들어주세요. 아래 포맷을 꼭 지켜주세요.

```yml
reviewers:
  - githubName: roseline124
    slackId: U07712R6TGS
    name: hyunjisong
  - githubName: roseline125
    slackId: U07712R6TGS
    name: leemonglyong
  - githubName: roseline126
    slackId: U07712R6TGS
    name: hongkildong
```

아래처럼 `reviewers_file` input으로 파일 path를 커스텀할 수 있어요.

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
        uses: roseline124/codereview-action
        with:
          github_token: ${{ secrets.CODEREVIEWBOT_GITHUB_TOKEN }}
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel: <SLACK_CHANNEL_ID>
          slack_workspace: <SLACK_WORKSPACE_NAME>
          reviewers_file: <CUSTOM_FILE_PATH>
```

4. input 관련 설명

| Input Name             | Description                                                                                                         | required | Default Value    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- | ---------------- |
| github_token           | github token 을 시크릿에 추가해주세요                                                                               | true     | X                |
| slack_token            | slack api > OAuth & Permissions > Bot User OAuth Token                                                              | true     | X                |
| slack_channel          | 슬랙 채널 링크에서 채널 ID를 뽑아낼 수 있습니다.                                                                    | true     | X                |
| slack_workspace        | 슬랙 워크스페이스 로고를 클릭하면 <workspace_name>.slack.com 이라고 뜨는데 여기서 워크스페이스 이름을 알 수 있어요. | true     | X                |
| reviewers_file         | reviewers.yml file path 를 커스텀할 수 있습니다.                                                                    | false    | reviewers.yml    |
| slack_merge_emoji_name | PR 머지 시에 슬랙 메시지에 이모지가 붙습니다.                                                                       | false    | white_check_mark |
| slack_close_emoji_name | PR 클로즈 시에 슬랙 메시지에 이모지가 붙습니다.                                                                     | false    | x                |
| emergency_label_name   | PR 오픈 시에 이 라벨이 있으면 긴급 메시지가 붙습니다.                                                               | false    | emergency        |

## test action

1. test action

1. test action

- `act pull_request` (you need to install act)

2. colima 사용하는 경우 에러가 난다면

- `sudo ln -s /Users/{username}/.colima/default/docker.sock /var/run/docker.sock`

3. 이벤트를 지정해서 실행

- pr open event: `act pull_request --eventpath event-open.json`

## release

1. 변경사항을 만든 뒤

- `pnpm build`
- 커밋 & 푸시

2. 만약 이 브랜치에 푸시한다면

- `feature` branch: alpha tag를 릴리즈합니다. (테스트할 때 사용하세요)
- `main` branch: 정식 버전을 릴리즈합니다. package.json의 버전을 업데이트합니다.
