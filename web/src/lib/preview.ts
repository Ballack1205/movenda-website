// Live preview mode (Sanity Presentation in the Studio). Only the separate
// preview service (`npm run preview:live`, PUBLIC_PREVIEW=true) turns this on.
// The public static sites never set it, so none of this ships to visitors.
import type { FilterDefault } from "@sanity/client/stega";

export const PREVIEW = import.meta.env.PUBLIC_PREVIEW === "true";

export const STUDIO_URL = import.meta.env.PUBLIC_STUDIO_URL || "https://movenda.sanity.studio";

/** How long preview data may be reused before refetching, so a refresh shows new edits. */
export const PREVIEW_TTL_MS = 3000;

/**
 * Stega (invisible edit markers) only goes on fields that are shown as text and
 * never compared or used in a URL. Everything else stays a clean string, so
 * code that matches on `categorie`, `slug`, `titel` and so on keeps working.
 */
const STEGA_FIELDS = new Set(["text", "bio", "bioEn", "motivatie", "motivatieEn", "quote", "opleiding", "tekst", "tekstEn"]);

export const stegaFilter: FilterDefault = (props) => {
  const last = props.sourcePath[props.sourcePath.length - 1];
  return typeof last === "string" && STEGA_FIELDS.has(last) && props.filterDefault(props);
};
