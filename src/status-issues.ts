/**
 * Diagnostic issues collector for Feishu channel.
 */

import type { ChannelAccountSnapshot, ChannelStatusIssue } from "openclaw/plugin-sdk";

type FeishuAccountStatus = {
  accountId?: unknown;
  enabled?: unknown;
  configured?: unknown;
  dmPolicy?: unknown;
  appId?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object");

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : undefined;

function readFeishuAccountStatus(value: ChannelAccountSnapshot): FeishuAccountStatus | null {
  if (!isRecord(value)) return null;
  return {
    accountId: value.accountId,
    enabled: value.enabled,
    configured: value.configured,
    dmPolicy: value.dmPolicy,
    appId: value.appId,
  };
}

/** Collect configuration issues for all Feishu accounts. */
export function collectFeishuStatusIssues(
  accounts: ChannelAccountSnapshot[],
): ChannelStatusIssue[] {
  const issues: ChannelStatusIssue[] = [];

  for (const entry of accounts) {
    const account = readFeishuAccountStatus(entry);
    if (!account) continue;
    const accountId = asString(account.accountId) ?? "default";
    const enabled = account.enabled !== false;
    const configured = account.configured === true;

    if (enabled && !configured) {
      issues.push({
        channel: "feishu",
        accountId,
        kind: "config",
        message: "Feishu account is enabled but not configured (missing appId or appSecret).",
        fix: "Set channels.feishu.appId and channels.feishu.appSecret in openclaw.json.",
      });
    }

    if (enabled && configured && account.dmPolicy === "open") {
      issues.push({
        channel: "feishu",
        accountId,
        kind: "config",
        message:
          'Feishu dmPolicy is "open", allowing any user to message the bot without pairing.',
        fix: 'Set channels.feishu.dmPolicy to "pairing" or "allowlist" to restrict access.',
      });
    }
  }

  return issues;
}
