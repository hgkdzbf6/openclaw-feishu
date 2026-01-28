/**
 * Feishu API connectivity probe.
 */

import * as Lark from "@larksuiteoapi/node-sdk";

import type { FeishuProbeResult } from "./types.js";

/**
 * Probe the Feishu API by fetching bot info.
 * Uses the internal tenant access token endpoint.
 */
export async function probeFeishu(
  appId: string,
  appSecret: string,
  timeoutMs = 5000,
): Promise<FeishuProbeResult> {
  if (!appId?.trim() || !appSecret?.trim()) {
    return { ok: false, error: "Missing appId or appSecret", elapsedMs: 0 };
  }

  const startTime = Date.now();

  try {
    const client = new Lark.Client({
      appId: appId.trim(),
      appSecret: appSecret.trim(),
      domain: Lark.Domain.Feishu,
      appType: Lark.AppType.SelfBuild,
    });

    // Use bot info endpoint to validate credentials
    const response = await (client as unknown as { bot: { v3: { botInfo: { get: (opts: Record<string, unknown>) => Promise<{ data?: { bot?: Record<string, unknown> } }> } } } }).bot.v3.botInfo.get({});

    const elapsedMs = Date.now() - startTime;

    const bot = response?.data?.bot;
    if (bot) {
      return {
        ok: true,
        bot: {
          name: (bot as Record<string, unknown>).bot_name as string | undefined,
          openId: (bot as Record<string, unknown>).open_id as string | undefined,
        },
        elapsedMs,
      };
    }

    return { ok: true, elapsedMs };
  } catch (err) {
    const elapsedMs = Date.now() - startTime;

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return { ok: false, error: `Request timed out after ${timeoutMs}ms`, elapsedMs };
      }
      return { ok: false, error: err.message, elapsedMs };
    }

    return { ok: false, error: String(err), elapsedMs };
  }
}
