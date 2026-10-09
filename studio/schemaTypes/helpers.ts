// Shared Studio chrome for Julie: English lives on its own tab so the Dutch
// fields she uses every day stay clean.
//
// Schema authors keep writing `fieldsets: [EN_FIELDSET]` on a type and
// `fieldset: "en"` on each English field. `engelsTabblad` (applied to every
// type in schemaTypes/index.ts) turns that marker into a real "English" tab:
// the English fields get `group: "en"`, and the Dutch fields get the
// "Nederlands" tab (types that already define their own groups keep them).

export const EN_FIELDSET = {
  name: "en",
  title: "Engels (optioneel)",
  options: { collapsible: true, collapsed: true },
  description: "Leeg laten mag. De site toont dan de Nederlandse tekst.",
} as const;

export const NL_GROUP = { name: "nl", title: "Nederlands", default: true } as const;
export const EN_GROUP = { name: "en", title: "English" } as const;

export const EN_TAB_NOTE = "Leeg = de Engelse site toont de Nederlandse tekst.";

export const SLUG_DESCRIPTION =
  "Klik 'Genereer' na het invullen van de naam. Alleen aanpassen als de URL écht anders moet.";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Def = Record<string, any>;

function walk(def: Def): void {
  if (!def || typeof def !== "object") return;
  const fields: Def[] = Array.isArray(def.fields) ? def.fields : [];
  // Children first, so nested sections get their own tabs.
  for (const field of fields) walk(field);
  if (Array.isArray(def.of)) for (const member of def.of) walk(member);

  const fieldsets: Def[] = Array.isArray(def.fieldsets) ? def.fieldsets : [];
  if (!fieldsets.some((f) => f?.name === "en")) return;

  const ownGroups = Array.isArray(def.groups) && def.groups.length > 0;
  def.groups = [...(ownGroups ? def.groups : [NL_GROUP]), EN_GROUP];
  const rest = fieldsets.filter((f) => f?.name !== "en");
  if (rest.length > 0) def.fieldsets = rest;
  else delete def.fieldsets;

  for (const field of fields) {
    if (field.fieldset === "en") {
      delete field.fieldset;
      field.group = "en";
    } else if (!ownGroups && field.group === undefined) {
      field.group = "nl";
    }
  }
}

/** Turn the `en` fieldset marker into an English tab (see top of file). */
export function engelsTabblad<T>(def: T): T {
  walk(def as Def);
  return def;
}
