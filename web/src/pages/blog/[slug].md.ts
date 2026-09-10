import type { APIRoute, GetStaticPaths } from "astro";
import { getBlogPostBySlug, getBlogPosts } from "../../lib/content";
import { portableTextToMarkdown } from "../../lib/blog-text";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ params: { slug: post.slug } }));
};

export const GET: APIRoute = async ({ params, site }) => {
  const post = await getBlogPostBySlug(params.slug!);
  if (!post) return new Response("Not found", { status: 404 });

  const origin = site?.origin || "https://movenda-preview.onrender.com";
  const body = portableTextToMarkdown(post.body);
  const markdown = `# ${post.titel}

${post.publicatiedatum}${post.auteurNaam ? ` · ${post.auteurNaam}` : ""}

${post.excerpt ? `> ${post.excerpt}\n` : ""}
Bron: ${origin}/blog/${post.slug}

${body}
`;

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
