/**
 * Type declarations for openclaw/plugin-sdk.
 * These are minimal declarations to satisfy TypeScript.
 */

declare module "openclaw/plugin-sdk" {
  export interface PluginRuntime {
    log?: {
      info?: (msg: string) => void;
      error?: (msg: string) => void;
      debug?: (msg: string) => void;
    };
    channel?: unknown;
  }

  export interface ClawdbotPluginApi {
    runtime: PluginRuntime;
    pluginConfig?: Record<string, unknown>;
    registerChannel(opts: { plugin: ChannelPlugin<unknown>; dock?: ChannelDock }): void;
  }

  export interface ClawdbotConfig {
    channels?: {
      feishu?: Record<string, unknown>;
      [key: string]: unknown;
    };
    plugins?: {
      entries?: Record<string, { config?: Record<string, unknown> }>;
    };
    [key: string]: unknown;
  }

  export interface ChannelAccountSnapshot {
    accountId: string;
    name?: string;
    enabled: boolean;
    configured: boolean;
    tokenSource?: string;
    running?: boolean;
    lastStartAt?: number | null;
    lastStopAt?: number | null;
    lastError?: string | null;
    [key: string]: unknown;
  }

  export interface ChannelStatusIssue {
    channel: string;
    accountId: string;
    kind: string;
    message: string;
    fix?: string;
  }

  export interface ChannelDock {
    id: string;
    capabilities?: {
      chatTypes?: string[];
      media?: boolean;
      blockStreaming?: boolean;
    };
    outbound?: { textChunkLimit?: number };
    config?: Record<string, unknown>;
    groups?: Record<string, unknown>;
    threading?: Record<string, unknown>;
  }

  export interface ChannelPlugin<T> {
    id: string;
    meta?: Record<string, unknown>;
    onboarding?: ChannelOnboardingAdapter;
    pairing?: Record<string, unknown>;
    capabilities?: Record<string, unknown>;
    reload?: { configPrefixes?: string[] };
    configSchema?: unknown;
    config?: Record<string, unknown>;
    security?: Record<string, unknown>;
    groups?: Record<string, unknown>;
    threading?: Record<string, unknown>;
    messaging?: Record<string, unknown>;
    directory?: Record<string, unknown>;
    setup?: Record<string, unknown>;
    outbound?: Record<string, unknown>;
    status?: Record<string, unknown>;
    gateway?: Record<string, unknown>;
  }

  export interface ChannelOnboardingAdapter {
    configuredCheck?: (cfg: ClawdbotConfig) => boolean;
    setDmPolicy?: (cfg: ClawdbotConfig, policy: ChannelOnboardingDmPolicy) => ClawdbotConfig;
    promptAllowFrom?: (params: {
      cfg: ClawdbotConfig;
      prompter: WizardPrompter;
      accountId: string;
    }) => Promise<ClawdbotConfig>;
    noteSetupHelp?: (prompter: WizardPrompter) => Promise<void>;
    runSetupWizard?: (params: {
      cfg: ClawdbotConfig;
      prompter: WizardPrompter;
      accountOverrides?: Record<string, unknown>;
      shouldPromptAccountIds?: boolean;
      forceAllowFrom?: boolean;
    }) => Promise<ClawdbotConfig>;
  }

  export type ChannelOnboardingDmPolicy = "pairing" | "allowlist" | "open" | "disabled";

  export interface WizardPrompter {
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
  }

  export const DEFAULT_ACCOUNT_ID: string;
  export const PAIRING_APPROVED_MESSAGE: string;

  export function normalizeAccountId(accountId?: string | null): string;
  export function formatPairingApproveHint(channel: string): string;
  export function buildChannelConfigSchema(schema: unknown): unknown;
  export function setAccountEnabledInConfigSection(opts: {
    cfg: ClawdbotConfig;
    sectionKey: string;
    accountId: string;
    enabled: boolean;
    allowTopLevel?: boolean;
  }): ClawdbotConfig;
  export function deleteAccountFromConfigSection(opts: {
    cfg: ClawdbotConfig;
    sectionKey: string;
    accountId: string;
    clearBaseFields?: string[];
  }): ClawdbotConfig;
  export function applyAccountNameToChannelSection(opts: {
    cfg: ClawdbotConfig;
    channelKey: string;
    accountId: string;
    name?: string;
  }): ClawdbotConfig;
  export function migrateBaseNameToDefaultAccount(opts: {
    cfg: ClawdbotConfig;
    channelKey: string;
  }): ClawdbotConfig;
  export function addWildcardAllowFrom(allowFrom?: unknown[]): unknown[];
  export function promptAccountId(params: {
    cfg: ClawdbotConfig;
    prompter: WizardPrompter;
    channel: string;
    listAccountIds: (cfg: ClawdbotConfig) => string[];
    resolveDefaultAccountId: (cfg: ClawdbotConfig) => string;
    shouldPrompt?: boolean;
  }): Promise<{ accountId: string; isNew: boolean }>;
  export function emptyPluginConfigSchema(): unknown;
}
