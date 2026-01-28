/**
 * Feishu config Zod schema for validation.
 */

import { z } from "zod";

const allowFromEntry = z.union([z.string(), z.number()]);

const feishuAccountSchema = z.object({
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  appId: z.string().optional(),
  appSecret: z.string().optional(),
  dmPolicy: z.enum(["pairing", "allowlist", "open", "disabled"]).optional(),
  allowFrom: z.array(allowFromEntry).optional(),
  thinkingThresholdMs: z.number().optional(),
  botNames: z.array(z.string()).optional(),
  mediaMaxMb: z.number().optional(),
});

export const FeishuConfigSchema = feishuAccountSchema.extend({
  accounts: z.object({}).catchall(feishuAccountSchema).optional(),
  defaultAccount: z.string().optional(),
});
