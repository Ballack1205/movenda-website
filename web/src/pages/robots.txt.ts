import type { APIRoute } from "astro";
import { NOINDEX, SITE_URL } from "../lib/site";

// robots.txt is generated at build time from the same PUBLIC_NOINDEX flag as
// the <meta name="robots"> tag, so the preview can never be indexed by
// accident and go-live is one env-var flip (plus removing the X-Robots-Tag
// header in render.yaml — see DECISIONS.md → Go-live).
//
// AI crawlers, once live:
// - Answer/search bots (they cite movenda.be in ChatGPT/Perplexity/Claude
//   answers — that is where "kinesist Hasselt" questions increasingly land):
//   explicitly allowed.
// - Training-only bots (GPTBot, Google-Extended, CCBot, ...): allowed by default.
//   Set BLOCK_AI_TRAINING to true if the founder/Julie decide the content may
//   not be used for model training. This does not affect Google Search.
const BLOCK_AI_TRAINING = false;

const SEARCH_BOTS = ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "Applebot", "DuckAssistBot"];
const TRAINING_BOTS = ["GPTBot", "Google-Extended", "CCBot", "anthropic-ai", "Bytespider", "meta-externalagent", "Amazonbot"];

export const GET: APIRoute = () => {
  const lines: string[] = [];

  if (NOINDEX) {
    lines.push(
      "# Pitch preview — do not index. Movenda has not confirmed go-live yet.",
      "# Generated from PUBLIC_NOINDEX (see DECISIONS.md).",
      "User-agent: *",
      "Disallow: /",
    );
  } else {
    lines.push(
      "# Movenda — kinesitherapie, personal training & performance, Hasselt.",
      "# Machine-readable summary for AI assistants: /llms.txt and /llms-full.txt",
      "",
      "User-agent: *",
      "Allow: /",
      "Disallow: /welkom",
      "",
      "# AI answer engines: welcome (they cite the site).",
      ...SEARCH_BOTS.flatMap((bot) => [`User-agent: ${bot}`]),
      "Allow: /",
      "",
    );
    if (BLOCK_AI_TRAINING) {
      lines.push(
        "# Model-training crawlers: not allowed (founder decision).",
        ...TRAINING_BOTS.flatMap((bot) => [`User-agent: ${bot}`]),
        "Disallow: /",
        "",
      );
    }
    lines.push(`Sitemap: ${SITE_URL}/sitemap-index.xml`);
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
