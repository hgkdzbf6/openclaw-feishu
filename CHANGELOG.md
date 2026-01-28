# Changelog

## 2026.1.28

### Initial Release

- Feishu (Lark) channel plugin for Moltbot/Clawdbot
- WebSocket long-connection via `@larksuiteoapi/node-sdk` (no public server required)
- Text message send/receive
- Media support: image, video, audio, file upload via Feishu API
- Group chat smart reply filtering (responds to @mentions, questions, request verbs)
- "Thinking…" placeholder UX with in-place update
- Message deduplication (handles Feishu duplicate event delivery)
- Multi-account support with account resolution pattern
- Onboarding wizard for guided setup
- Health probe (Feishu API connectivity check)
- Status diagnostics for misconfiguration detection
- DM + group chat types in ChannelDock capabilities
- Session key mapping: `feishu:<chatId>` for groups, `feishu:<senderId>` for DMs
- Configurable bot names for group-chat address detection
- Configurable thinking threshold
