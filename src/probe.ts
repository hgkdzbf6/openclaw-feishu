/**
 * Feishu API connectivity probe.
 */

import * as Lark from "@larksuiteoapi/node-sdk";

import type { FeishuProbeResult } from "./types.js";

/**
 * Probe the Feishu API by validating credentials via tenant_access_token/internal.
 * @larksuiteoapi/node-sdk does not expose bot.v3.botInfo; we use auth instead.
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

    // Validate credentials via tenant_access_token/internal (self-built app)
    await client.auth.v3.tenantAccessToken.internal({
      data: { app_id: appId.trim(), app_secret: appSecret.trim() },
    });

    const elapsedMs = Date.now() - startTime;
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
