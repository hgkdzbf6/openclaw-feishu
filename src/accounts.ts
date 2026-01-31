/**
 * Feishu account resolution — multi-account support.
 */

import type { ClawdbotConfig } from "openclaw/plugin-sdk";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk";

import type {
  FeishuAccountConfig,
  FeishuConfig,
  ResolvedFeishuAccount,
} from "./types.js";

function listConfiguredAccountIds(cfg: ClawdbotConfig): string[] {
  const accounts = (cfg.channels?.feishu as FeishuConfig | undefined)?.accounts;
  if (!accounts || typeof accounts !== "object") return [];
  return Object.keys(accounts).filter(Boolean);
}

/** List all configured Feishu account IDs (falls back to ["default"]). */
export function listFeishuAccountIds(cfg: ClawdbotConfig): string[] {
  const ids = listConfiguredAccountIds(cfg);
  if (ids.length === 0) return [DEFAULT_ACCOUNT_ID];
  return ids.sort((a, b) => a.localeCompare(b));
}

/** Resolve the default account ID. */
export function resolveDefaultFeishuAccountId(cfg: ClawdbotConfig): string {
  const feishuConfig = cfg.channels?.feishu as FeishuConfig | undefined;
  if (feishuConfig?.defaultAccount?.trim()) return feishuConfig.defaultAccount.trim();
  const ids = listFeishuAccountIds(cfg);
  if (ids.includes(DEFAULT_ACCOUNT_ID)) return DEFAULT_ACCOUNT_ID;
  return ids[0] ?? DEFAULT_ACCOUNT_ID;
}

function resolveAccountConfig(
  cfg: ClawdbotConfig,
  accountId: string,
): FeishuAccountConfig | undefined {
  const accounts = (cfg.channels?.feishu as FeishuConfig | undefined)?.accounts;
  if (!accounts || typeof accounts !== "object") return undefined;
  return accounts[accountId] as FeishuAccountConfig | undefined;
}

function mergeFeishuAccountConfig(cfg: ClawdbotConfig, accountId: string): FeishuAccountConfig {
  const raw = (cfg.channels?.feishu ?? {}) as FeishuConfig;
  const { accounts: _ignored, defaultAccount: _ignored2, ...base } = raw;
  const account = resolveAccountConfig(cfg, accountId) ?? {};
  return { ...base, ...account };
}

/**
 * Resolve appId + appSecret for an account.
 * Checks: account config → base config → plugin config.
 */
function resolveCredentials(
  cfg: ClawdbotConfig,
  merged: FeishuAccountConfig,
): { appId: string; appSecret: string; source: "config" | "plugin" | "none" } {
  // From channel config
  if (merged.appId?.trim() && merged.appSecret?.trim()) {
    return { appId: merged.appId.trim(), appSecret: merged.appSecret.trim(), source: "config" };
  }

  // From plugin config: plugins.entries.openclaw-feishu only (plugin id; do not use plugins.entries.feishu — causes "plugin not found: feishu")
  const pluginCfg = (cfg as Record<string, unknown>).plugins as
    | { entries?: Record<string, { appId?: string; appSecret?: string }> }
    | undefined;
  const feishuPluginEntry = pluginCfg?.entries?.["openclaw-feishu"];
  if (feishuPluginEntry?.appId?.trim() && feishuPluginEntry?.appSecret?.trim()) {
    return { appId: feishuPluginEntry.appId.trim(), appSecret: feishuPluginEntry.appSecret.trim(), source: "plugin" };
  }

  return { appId: "", appSecret: "", source: "none" };
}

/** Fully resolve a Feishu account. */
export function resolveFeishuAccount(params: {
  cfg: ClawdbotConfig;
  accountId?: string | null;
}): ResolvedFeishuAccount {
  const accountId = normalizeAccountId(params.accountId);
  const baseEnabled = (params.cfg.channels?.feishu as FeishuConfig | undefined)?.enabled !== false;
  const merged = mergeFeishuAccountConfig(params.cfg, accountId);
  const accountEnabled = merged.enabled !== false;
  const enabled = baseEnabled && accountEnabled;
  const creds = resolveCredentials(params.cfg, merged);

  return {
    accountId,
    name: merged.name?.trim() || undefined,
    enabled,
    appId: creds.appId,
    appSecret: creds.appSecret,
    tokenSource: creds.source,
    config: merged,
  };
}

/** List all enabled Feishu accounts. */
export function listEnabledFeishuAccounts(cfg: ClawdbotConfig): ResolvedFeishuAccount[] {
  return listFeishuAccountIds(cfg)
    .map((accountId) => resolveFeishuAccount({ cfg, accountId }))
    .filter((account) => account.enabled);
}
