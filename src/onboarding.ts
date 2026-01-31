/**
 * Feishu onboarding wizard adapter.
 */

import type {
  ClawdbotConfig,
} from "openclaw/plugin-sdk";
import {
  addWildcardAllowFrom,
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
} from "openclaw/plugin-sdk";

import {
  listFeishuAccountIds,
  resolveDefaultFeishuAccountId,
  resolveFeishuAccount,
} from "./accounts.js";

const channel = "feishu" as const;

function setFeishuDmPolicy(
  cfg: ClawdbotConfig,
  dmPolicy: "pairing" | "allowlist" | "open" | "disabled",
): ClawdbotConfig {
  const feishuCfg = cfg.channels?.feishu ?? {};
  const existingAllowFrom = Array.isArray(feishuCfg.allowFrom) ? feishuCfg.allowFrom : [];
  const allowFrom =
    dmPolicy === "open" ? addWildcardAllowFrom(existingAllowFrom) : undefined;
  return {
    ...cfg,
    channels: {
      ...(cfg.channels ?? {}),
      feishu: {
        ...feishuCfg,
        dmPolicy,
        ...(allowFrom ? { allowFrom } : {}),
      },
    },
  } as ClawdbotConfig;
}

async function noteFeishuSetupHelp(prompter: WizardPrompter): Promise<void> {
  await prompter.note(
    [
      "1) Go to https://open.feishu.cn/app → Create self-built app",
      "2) Add Bot capability to the app",
      '3) Enable permissions: im:message, im:message.group_at_msg, im:message.p2p_msg',
      '4) Events: add im.message.receive_v1, set delivery to "WebSocket long-connection"',
      "5) Publish the app (create version → request approval)",
      "6) Note the App ID (cli_xxx) and App Secret",
      "",
      "Docs: https://open.feishu.cn/document/home/index",
    ].join("\n"),
    "Feishu Bot Setup",
  );
}

/** WizardPrompter interface for onboarding. */
interface WizardPrompter {
  note(message: string, title?: string): Promise<void>;
  text(opts: {
    message: string;
    placeholder?: string;
    initialValue?: string;
    validate?: (value: unknown) => string | undefined;
  }): Promise<string>;
  select<T>(opts: {
    message: string;
    options: Array<{ value: T; label: string }>;
    initialValue?: T;
  }): Promise<T>;
  confirm?(opts: { message: string; initialValue?: boolean }): Promise<boolean>;
}

async function promptFeishuAllowFrom(params: {
  cfg: ClawdbotConfig;
  prompter: WizardPrompter;
  accountId: string;
}): Promise<ClawdbotConfig> {
  const { cfg, prompter, accountId } = params;
  const resolved = resolveFeishuAccount({ cfg, accountId });
  const existingAllowFrom = resolved.config.allowFrom ?? [];
  const entry = await prompter.text({
    message: "Feishu allowFrom (open_id or union_id)",
    placeholder: "ou_xxxxxxxxxx",
    initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : undefined,
    validate: (value: unknown) => {
      const raw = String(value ?? "").trim();
      if (!raw) return "Required";
      return undefined;
    },
  });
  const normalized = String(entry).trim();
  const merged = [
    ...existingAllowFrom.map((item: unknown) => String(item).trim()).filter(Boolean),
    normalized,
  ];
  const unique = [...new Set(merged)];

  const feishuCfg = (cfg.channels?.feishu ?? {}) as Record<string, unknown>;
  const accounts = (feishuCfg.accounts ?? {}) as Record<string, unknown>;

  if (accountId === DEFAULT_ACCOUNT_ID) {
    return {
      ...cfg,
      channels: {
        ...((cfg.channels ?? {}) as Record<string, unknown>),
        feishu: {
          ...feishuCfg,
          enabled: true,
          dmPolicy: "allowlist",
          allowFrom: unique,
        },
      },
    } as ClawdbotConfig;
  }

  const accountCfg = (accounts[accountId] ?? {}) as Record<string, unknown>;
  return {
    ...cfg,
    channels: {
      ...((cfg.channels ?? {}) as Record<string, unknown>),
      feishu: {
        ...feishuCfg,
        enabled: true,
        accounts: {
          ...accounts,
          [accountId]: {
            ...accountCfg,
            enabled: accountCfg.enabled ?? true,
            dmPolicy: "allowlist",
            allowFrom: unique,
          },
        },
      },
    },
  } as ClawdbotConfig;
}

/** Feishu onboarding adapter for the channel. */
export const feishuOnboardingAdapter = {
  /** Check if Feishu channel is configured. */
  configuredCheck: (cfg: ClawdbotConfig): boolean => {
    return listFeishuAccountIds(cfg).some((accountId) =>
      Boolean(resolveFeishuAccount({ cfg, accountId }).appId),
    );
  },

  /** Set the DM policy. */
  setDmPolicy: (cfg: ClawdbotConfig, policy: "pairing" | "allowlist" | "open" | "disabled"): ClawdbotConfig => {
    return setFeishuDmPolicy(cfg, policy);
  },

  /** Prompt user for allowFrom configuration. */
  promptAllowFrom: async (params: {
    cfg: ClawdbotConfig;
    prompter: WizardPrompter;
    accountId: string;
  }): Promise<ClawdbotConfig> => {
    return promptFeishuAllowFrom(params);
  },

  /** Show setup help notes. */
  noteSetupHelp: async (prompter: WizardPrompter): Promise<void> => {
    return noteFeishuSetupHelp(prompter);
  },

  /** Run the full setup wizard. */
  runSetupWizard: async (params: {
    cfg: ClawdbotConfig;
    prompter: WizardPrompter;
    accountOverrides?: Record<string, string | undefined>;
    shouldPromptAccountIds?: boolean;
    forceAllowFrom?: boolean;
  }): Promise<ClawdbotConfig> => {
    const { cfg, prompter, accountOverrides, shouldPromptAccountIds, forceAllowFrom } = params;
    const feishuOverride = accountOverrides?.feishu?.trim();
    const defaultAccountId = resolveDefaultFeishuAccountId(cfg);
    let feishuAccountId = feishuOverride
      ? normalizeAccountId(feishuOverride)
      : defaultAccountId;

    if (shouldPromptAccountIds && !feishuOverride) {
      const accountIds = listFeishuAccountIds(cfg);
      const options = accountIds.map((id) => ({ value: id, label: id }));
      feishuAccountId = await prompter.select({
        message: "Select Feishu account",
        options,
        initialValue: feishuAccountId,
      });
    }

    let next = cfg;
    const resolvedAccount = resolveFeishuAccount({ cfg: next, accountId: feishuAccountId });
    const accountConfigured = Boolean(resolvedAccount.appId);

    if (!accountConfigured) {
      await noteFeishuSetupHelp(prompter);
    }

    const hasConfigCredentials = Boolean(
      resolvedAccount.config.appId && resolvedAccount.config.appSecret,
    );

    let appId: string | null = null;
    let appSecret: string | null = null;

    if (hasConfigCredentials && prompter.confirm) {
      const keep = await prompter.confirm({
        message: "Feishu credentials already configured. Keep them?",
        initialValue: true,
      });
      if (!keep) {
        appId = String(
          await prompter.text({
            message: "Enter Feishu App ID (cli_xxx)",
            validate: (value: unknown) => (String(value ?? "").trim() ? undefined : "Required"),
          }),
        ).trim();
        appSecret = String(
          await prompter.text({
            message: "Enter Feishu App Secret",
            validate: (value: unknown) => (String(value ?? "").trim() ? undefined : "Required"),
          }),
        ).trim();
      }
    } else if (!hasConfigCredentials) {
      appId = String(
        await prompter.text({
          message: "Enter Feishu App ID (cli_xxx)",
          validate: (value: unknown) => (String(value ?? "").trim() ? undefined : "Required"),
        }),
      ).trim();
      appSecret = String(
        await prompter.text({
          message: "Enter Feishu App Secret",
          validate: (value: unknown) => (String(value ?? "").trim() ? undefined : "Required"),
        }),
      ).trim();
    }

    const feishuCfg2 = (next.channels?.feishu ?? {}) as Record<string, unknown>;
    const accounts2 = (feishuCfg2.accounts ?? {}) as Record<string, unknown>;

    if (appId && appSecret) {
      if (feishuAccountId === DEFAULT_ACCOUNT_ID) {
        next = {
          ...next,
          channels: {
            ...((next.channels ?? {}) as Record<string, unknown>),
            feishu: {
              ...feishuCfg2,
              enabled: true,
              appId,
              appSecret,
            },
          },
        } as ClawdbotConfig;
      } else {
        const accountCfg2 = (accounts2[feishuAccountId] ?? {}) as Record<string, unknown>;
        next = {
          ...next,
          channels: {
            ...((next.channels ?? {}) as Record<string, unknown>),
            feishu: {
              ...feishuCfg2,
              enabled: true,
              accounts: {
                ...accounts2,
                [feishuAccountId]: {
                  ...accountCfg2,
                  enabled: true,
                  appId,
                  appSecret,
                },
              },
            },
          },
        } as ClawdbotConfig;
      }
    }

    if (forceAllowFrom) {
      next = await promptFeishuAllowFrom({
        cfg: next,
        prompter,
        accountId: feishuAccountId,
      });
    }

    return next;
  },
};
