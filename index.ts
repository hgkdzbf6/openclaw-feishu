/**
 * Feishu (Lark) channel plugin for Clawdbot/Moltbot.
 *
 * Connects Feishu bots via WebSocket long-connection (no public server required).
 */

import type { ClawdbotPluginApi } from "clawdbot/plugin-sdk";

import { feishuDock, feishuPlugin } from "./src/channel.js";
import { setFeishuRuntime } from "./src/runtime.js";

const plugin = {
  id: "feishu",
  name: "Feishu",
  description: "Feishu (Lark) channel plugin — WebSocket long-connection bot",
  configSchema: {
    type: "object" as const,
    properties: {
      appId: { type: "string" as const, description: "Feishu App ID" },
      appSecret: { type: "string" as const, description: "Feishu App Secret" },
    },
    required: ["appId", "appSecret"] as const,
    additionalProperties: false as const,
  },
  register(api: ClawdbotPluginApi) {
    setFeishuRuntime(api.runtime);

    // If plugin-level config has appId/appSecret, start the client eagerly
    const pluginCfg = api.pluginConfig as { appId?: string; appSecret?: string } | undefined;
    if (pluginCfg?.appId && pluginCfg?.appSecret) {
      api.runtime.log?.info?.(
        `[feishu] Plugin config detected (appId=${pluginCfg.appId.slice(0, 8)}...)`,
      );
    }

    api.registerChannel({ plugin: feishuPlugin, dock: feishuDock });
  },
};

export default plugin;
