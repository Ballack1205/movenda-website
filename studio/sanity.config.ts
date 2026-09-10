import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { deskStructure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

// i18n approach: plain sibling fields (e.g. `rol` / `rolEn`, `bio` / `bioEn`)
// instead of the internationalized-array plugin. Dutch is required, English
// is optional and falls back to Dutch on the site. This is simpler for
// Julie than a plugin-driven array widget and matches DECISIONS.md.
export default defineConfig({
  name: "movenda",
  title: "Movenda",
  projectId,
  dataset,
  basePath: "/",
  plugins: [structureTool({ structure: deskStructure }), visionTool()],
  schema: { types: schemaTypes },
});
