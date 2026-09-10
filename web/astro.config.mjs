// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// PUBLIC_SITE_URL is set as a Render env var; falls back to the preview
// URL locally. Flip PUBLIC_NOINDEX to "false" only after go-live.
const site = process.env.PUBLIC_SITE_URL || "https://movenda-preview.onrender.com";

// https://astro.build/config
export default defineConfig({
  site,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
