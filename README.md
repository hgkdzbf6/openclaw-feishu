# moltbot-feishu

[![npm version](https://img.shields.io/npm/v/moltbot-feishu.svg)](https://www.npmjs.com/package/moltbot-feishu)
[![license](https://img.shields.io/npm/l/moltbot-feishu.svg)](https://github.com/AlexAnys/moltbot-feishu/blob/main/LICENSE)

Feishu (飞书 / Lark) channel plugin for [Moltbot](https://github.com/moltbot/moltbot).

Connect your Feishu bot to Moltbot via **WebSocket long-connection** — no public server, domain, or HTTPS required.

## Architecture

```
Feishu user → Feishu cloud ←WS→ Plugin (local) ←→ Moltbot Gateway → AI agent
```

- Feishu SDK connects outbound (no inbound port needed)
- Each Feishu chat maps to a Moltbot session (`feishu:<chatId>`)
- Supports both DM (p2p) and group chats
- Smart group-chat reply filtering (responds to @mentions, questions, requests)
- "Thinking…" placeholder UX while AI processes

## Installation

```bash
clawdbot plugins install moltbot-feishu
```

Or via npm directly:

```bash
npm install moltbot-feishu
```

## Setup

### 1. Create Feishu Bot

1. Go to [open.feishu.cn/app](https://open.feishu.cn/app) → Create self-built app
2. Add **Bot** capability
3. Enable permissions:
   - `im:message` (send messages)
   - `im:message.group_at_msg` (receive group @mentions)
   - `im:message.p2p_msg` (receive DM)
4. Events: add `im.message.receive_v1`, set delivery to **WebSocket long-connection**
5. Publish the app (create version → request approval)
6. Note the **App ID** (`cli_xxx`) and **App Secret**

### 2. Configure

Add to your `clawdbot.json`:

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_xxxxxxxxxx",
      "appSecret": "your-app-secret-here",
      "dmPolicy": "pairing"
    }
  }
}
```

Or use the onboarding wizard:

```bash
clawdbot setup feishu
```

### 3. Verify

```bash
clawdbot channels status feishu
```

## Features

| Feature | Status |
|---------|--------|
| Text messages | ✅ |
| Images | ✅ |
| Video/Audio/Files | ✅ |
| Group chat with smart filtering | ✅ |
| "Thinking…" placeholder UX | ✅ |
| Multi-account | ✅ |
| Message deduplication | ✅ |
| Onboarding wizard | ✅ |
| Health probe | ✅ |

## Configuration Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `appId` | string | — | Feishu App ID (required) |
| `appSecret` | string | — | Feishu App Secret (required) |
| `enabled` | boolean | `true` | Enable/disable this account |
| `dmPolicy` | string | `"pairing"` | DM access: `pairing`, `allowlist`, `open`, `disabled` |
| `allowFrom` | string[] | `[]` | Allowlisted Feishu user IDs |
| `thinkingThresholdMs` | number | `2500` | Delay before "Thinking…" (0 to disable) |
| `botNames` | string[] | `["bot","助手"]` | Bot name patterns for group-chat detection |
| `mediaMaxMb` | number | `5` | Max inbound media size in MB |

## Multi-Account Setup

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "accounts": {
        "work": {
          "appId": "cli_aaa",
          "appSecret": "secret-a"
        },
        "personal": {
          "appId": "cli_bbb",
          "appSecret": "secret-b"
        }
      },
      "defaultAccount": "work"
    }
  }
}
```

## Session Keys

- DM: `feishu:<senderId>`
- Group: `feishu:<chatId>`

## Group Chat Behavior

In group chats, the bot only responds when:
- Directly @mentioned
- Message ends with `?` or `？`
- Message contains question words (why, how, what, 帮, 请, 麻烦...)
- Message starts with bot name

This prevents spam and keeps the bot focused on real requests.

## Troubleshooting

### "Missing appId or appSecret"
Ensure credentials are set in `clawdbot.json` under `channels.feishu`.

### Bot not receiving messages
1. Check app is published and approved in Feishu admin console
2. Verify `im.message.receive_v1` event is enabled with WebSocket delivery
3. Run `clawdbot channels status feishu` to check connection status

### Group chat not responding
Bot requires @mention or recognized question pattern. Try @mentioning the bot directly.

## Links

- [Moltbot Documentation](https://docs.molt.bot)
- [Feishu Open Platform](https://open.feishu.cn)
- [GitHub Issues](https://github.com/AlexAnys/moltbot-feishu/issues)

## License

MIT © Alex Yang
