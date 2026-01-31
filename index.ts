/**
 * Feishu (Lark) channel plugin for Openclaw.
 *
 * Connects Feishu bots via WebSocket long-connection (no public server required).
 */

import type { ClawdbotPluginApi } from "openclaw/plugin-sdk";

import { feishuDock, feishuPlugin } from "./src/channel.js";
import { setFeishuRuntime } from "./src/runtime.js";

const pluginConfigSchema = {
  toJSONSchema: () =>
    ({
      type: "object",
      properties: {
        appId: { type: "string", description: "Feishu app ID (optional; can be set per-account in channels.feishu)" },
        appSecret: { type: "string", description: "Feishu app secret (optional; can be set per-account in channels.feishu)" },
      },
      additionalProperties: true,
    }),
};

const plugin = {
  id: "openclaw-feishu",
  name: "Feishu",
  description: "Feishu (Lark) channel plugin — WebSocket long-connection bot",
  configSchema: pluginConfigSchema,
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
