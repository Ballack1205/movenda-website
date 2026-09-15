import { defineConfig, type DocumentActionComponent } from "sanity";
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

// Julie asked for a "duplicate" next to "create" for blogposts and the like.
// Sanity has the action, but buried at the bottom of the ⋮ menu. For these
// record types we move it right under Publiceren, give it a clearer label
// and also show it in the pane header menu (⋮ next to the document title).
const DUPLICATE_FIRST = new Set(["blogPost", "dienst", "faq", "vacature", "popup", "getuigenis", "prijsitem", "lesrooster", "teamlid", "partner"]);

const withProminentDuplicate = (Action: DocumentActionComponent): DocumentActionComponent => {
  const Wrapped: DocumentActionComponent = (props) => {
    const description = Action(props);
    if (!description) return description;
    return {
      ...description,
      label: "Dupliceren als nieuw concept",
      title: "Maakt een kopie van dit document als concept. Pas de titel en de slug aan en publiceer.",
      group: ["default", "paneActions"],
    };
  };
  Wrapped.action = Action.action;
  Wrapped.displayName = "ProminentDuplicateAction";
  return Wrapped;
};

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
      if (DUPLICATE_FIRST.has(context.schemaType)) {
        const duplicate = prev.find((action) => action.action === "duplicate");
        if (duplicate) {
          const rest = prev.filter((action) => action.action !== "duplicate");
          // [Publiceren, Dupliceren, ...rest]
          return [rest[0], withProminentDuplicate(duplicate), ...rest.slice(1)].filter(Boolean);
        }
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
