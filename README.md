# openclaw-feishu

[![npm version](https://img.shields.io/npm/v/openclaw-feishu.svg)](https://www.npmjs.com/package/openclaw-feishu)

让 OpenClaw AI 助手接入飞书，无需公网服务器。

## 特点

- **无需服务器** — 基于飞书 WebSocket 长连接，本地运行即可
- **私聊 + 群聊** — 都支持，群里 @ 机器人或直接发消息
- **图片与文件** — 收发都支持
- **多账号** — 可配置多个飞书应用/账号

## 快速开始

### 1. 创建飞书应用与机器人

1. 打开 [飞书开放平台](https://open.feishu.cn/app) → 创建**企业自建应用**
2. 在应用中添加「**机器人**」能力
3. **权限配置**中开启：
   - `im:message`（发消息）
   - `im:message.group_at_msg`（群聊 @ 消息）
   - `im:message.p2p_msg`（私聊消息）
4. **事件订阅** → 添加 `im.message.receive_v1` → 选择「**使用长连接接收事件**」
5. **版本管理** → 创建版本 → 申请上线
6. 记下 **App ID**（形如 `cli_xxx`）和 **App Secret**

### 2. 安装插件

```bash
openclaw plugins install openclaw-feishu
```

### 3. 配置

**推荐：直接编辑配置文件**（飞书为插件通道，CLI 向导可能不包含 feishu，请改配置文件）。

编辑 `~/.openclaw/openclaw.json`，在 `channels` 下增加 `feishu`，并确保插件已启用：

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_你的AppID",
      "appSecret": "你的AppSecret"
    }
  },
  "plugins": {
    "entries": {
      "openclaw-feishu": { "enabled": true }
    }
  }
}
```

注意：**appId、appSecret 必须写在 `channels.feishu` 下**，不要写在 `plugins.entries.openclaw-feishu` 里，否则可能触发配置校验报错。

若希望用交互式向导，可先运行 `openclaw configure`，在通道相关步骤中如出现 Feishu 再按提示填写；若没有 Feishu 选项，仍请按上面方式编辑 `openclaw.json`。

### 4. 启动

```bash
openclaw gateway restart
```

之后在飞书中找到你的机器人即可开始对话。

## 群聊说明

群聊中机器人不会回复每一条消息（避免刷屏），只会在以下情况回复：

- 被 @
- 消息以问号结尾
- 消息包含「帮」「请」「怎么」等求助词

## 常见问题

**Q: 机器人收不到消息？**

检查：① 应用已发布上线（非草稿）；② 事件订阅选择的是「长连接」而非 webhook；③ 上述权限均已开启。

**Q: 群聊里不回复？**

尝试 @ 机器人，或在消息末尾加问号。

**Q: 如何查看飞书通道状态？**

```bash
openclaw channels status feishu
```

## 链接

- [OpenClaw 文档](https://docs.openclaw.ai)
- [飞书开放平台文档](https://open.feishu.cn/document/home/index)
- [问题反馈](https://github.com/AlexAnys/openclaw-feishu/issues)

## 协议

MIT
