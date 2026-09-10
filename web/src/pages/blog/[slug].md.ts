import type { APIRoute, GetStaticPaths } from "astro";
import { getBlogPostBySlug, getBlogPosts } from "../../lib/content";
import { blogPostToMarkdown } from "../../lib/blog-text";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ params: { slug: post.slug } }));
};

export const GET: APIRoute = async ({ params }) => {
  const post = await getBlogPostBySlug(params.slug!);
  if (!post) return new Response("Not found", { status: 404 });

  return new Response(blogPostToMarkdown(post), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
