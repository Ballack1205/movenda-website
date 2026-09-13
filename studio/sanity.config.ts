import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { nlNLLocale } from "@sanity/locale-nl-nl";
import { schemaTypes } from "./schemaTypes";
import { deskStructure } from "./structure";
import { resolvePreviewUrl } from "./preview";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const showVision = process.env.SANITY_STUDIO_VISION === "true";

const NO_DELETE = new Set(["siteSettings", "keuzehulp", "locatie", "pagina"]);
const HIDE_FROM_CREATE = new Set(["siteSettings", "keuzehulp", "locatie", "pagina", "googleReviewInfo", "homePijler"]);

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
  plugins: [
    structureTool({ structure: deskStructure }),
    nlNLLocale({ title: "Nederlands" }),
    ...(showVision ? [visionTool()] : []),
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (prev, context) => {
      if (NO_DELETE.has(context.schemaType)) {
        return prev.filter((action) => action.action !== "delete" && action.action !== "duplicate");
      }
      return prev;
    },
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter((template) => !HIDE_FROM_CREATE.has(template.templateId));
      }
      return prev;
    },
    productionUrl: async (prev, context) => resolvePreviewUrl(context.document) ?? prev,
  },
});
