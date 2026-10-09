import { defineConfig, type DocumentActionComponent } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { defineDocuments, defineLocations, presentationTool } from "sanity/presentation";
import { nlNLLocale } from "@sanity/locale-nl-nl";
import { schemaTypes } from "./schemaTypes";
import { deskStructure } from "./structure";
import { LIVE_PREVIEW_URL, resolvePreviewPath, resolvePreviewUrl } from "./preview";
import { bulkPublishTool } from "./tools/bulkPublish";
import { withErrorList } from "./actions/publishWithErrors";
import { withBekijkOpSite } from "./components/BekijkOpSite";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const showVision = process.env.SANITY_STUDIO_VISION === "true";

const NO_DELETE = new Set(["siteSettings", "keuzehulp", "verwijskompas", "locatie", "pagina"]);
const HIDE_FROM_CREATE = new Set(["siteSettings", "keuzehulp", "verwijskompas", "locatie", "pagina", "googleReviewInfo", "homePijler", "lesrooster-op-dag"]);

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

// Live preview tab (Sanity Presentation): the page next to the form, drafts
// included, click text to open its field. Each type points at the page it
// lives on, reusing the same mapping as the "Bekijk op de site" button.
const LOCATION_FIELDS = { slug: "slug.current", categorie: "categorie", locatie: "locatie", key: "key" };
const PRESENTATION_TYPES = [
  "pagina", "actiepagina", "teamlid", "blogPost", "locatie", "dienst", "faq", "event", "prijsitem",
  "vacature", "getuigenis", "sportaanbodItem", "lesrooster", "popup", "siteSettings", "partner", "homePijler", "homeDeur",
];
const presentationLocations = Object.fromEntries(
  PRESENTATION_TYPES.map((type) => [
    type,
    defineLocations({
      select: LOCATION_FIELDS,
      resolve: (doc) => {
        const path = doc ? resolvePreviewPath({ _type: type, ...doc }) : undefined;
        return path ? { locations: [{ title: "Op de site", href: path }] } : undefined;
      },
    }),
  ]),
);

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
    // Only when a live preview service exists (SANITY_STUDIO_LIVE_PREVIEW_URL).
    ...(LIVE_PREVIEW_URL
      ? [
          presentationTool({
            previewUrl: { initial: LIVE_PREVIEW_URL },
            title: "Live voorbeeld",
            resolve: {
              locations: presentationLocations,
              mainDocuments: defineDocuments([
                { route: "/team/:slug", filter: `_type == "teamlid" && slug.current == $slug` },
                { route: "/en/team/:slug", filter: `_type == "teamlid" && slug.current == $slug` },
                { route: "/blog/:slug", filter: `_type == "blogPost" && slug.current == $slug` },
                { route: "/locaties/:slug", filter: `_type == "locatie" && slug.current == $slug` },
                { route: "/events/:slug", filter: `_type == "event" && slug.current == $slug` },
              ]),
            },
          }),
        ]
      : []),
    nlNLLocale({ title: "Nederlands" }),
    ...(showVision ? [visionTool()] : []),
  ],
  tools: (prev) => [...prev, bulkPublishTool],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: "lesrooster-op-dag",
        title: "Les op deze dag",
        schemaType: "lesrooster",
        parameters: [{ name: "dag", type: "string" }],
        value: ({ dag }: { dag: string }) => ({ dag, zichtbaar: true }),
      },
    ],
  },
  form: { components: { input: withBekijkOpSite } },
  document: {
    actions: (input, context) => {
      const prev = input.map((action) => (action.action === "publish" ? withErrorList(action) : action));
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
