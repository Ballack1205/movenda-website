import type { APIRoute } from "astro";
import { getBlogPosts } from "../lib/content";

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin || "https://movenda-preview.onrender.com";
  const posts = await getBlogPosts();
  const items = posts
    .map((post) => {
      const excerpt = post.excerpt ? `\n\n${post.excerpt}` : "";
      return `## [${post.titel}](${origin}/blog/${post.slug})\n\n${post.publicatiedatum}${post.auteurNaam ? ` · ${post.auteurNaam}` : ""}${excerpt}\n\nVolledige tekst: ${origin}/blog/${post.slug}.md`;
    })
    .join("\n\n");

  const body = `# Movenda blog

Praktische tips over kinesitherapie, training en herstel van Sportpraktijk Movenda in Hasselt.

${items}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
