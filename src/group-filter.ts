/**
 * Smart group chat reply filter.
 *
 * In group chats, only respond when the message looks like a real
 * question, request, or direct address — avoids spamming.
 */

/** Default bot name patterns for address detection. */
const DEFAULT_BOT_NAMES = ["openclaw", "bot", "助手", "智能体"];

/**
 * Determine whether the bot should respond to a group message.
 *
 * @param text - Message text (after stripping @mention placeholders)
 * @param mentions - Array of mention objects from the Feishu event
 * @param botNames - Custom bot name list for address detection
 */
export function shouldRespondInGroup(
  text: string,
  mentions: unknown[],
  botNames?: string[],
): boolean {
  // Always respond to @-mentions
  if (mentions.length > 0) return true;

  const t = text.toLowerCase();

  // Ends with question mark
  if (/[？?]$/.test(text)) return true;

  // English question words
  if (/\b(why|how|what|when|where|who|help)\b/.test(t)) return true;

  // Chinese request verbs
  const verbs = [
    "帮", "麻烦", "请", "能否", "可以", "解释", "看看",
    "排查", "分析", "总结", "写", "改", "修", "查", "对比", "翻译",
  ];
  if (verbs.some((k) => text.includes(k))) return true;

  // Direct address by bot name
  const names = botNames?.length ? botNames : DEFAULT_BOT_NAMES;
  const namePattern = new RegExp(
    `^(${names.map(escapeRegex).join("|")})[\\s,:，：]`,
    "i",
  );
  if (namePattern.test(text)) return true;

  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
