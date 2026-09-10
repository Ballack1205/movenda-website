import type { APIRoute } from "astro";
import { getBlogPosts } from "../lib/content";
import { escapeXml } from "../lib/blog-text";
import { SITE_URL } from "../lib/site";

export const GET: APIRoute = async () => {
  const posts = await getBlogPosts();
  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.titel)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(post.publicatiedatum).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt || "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Movenda blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Praktische tips over kinesitherapie, training en herstel.</description>
    <language>nl-be</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
