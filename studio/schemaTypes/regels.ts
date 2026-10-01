import type { CustomValidator, ObjectSchemaType, SchemaType, ValidationContext } from "sanity";

// Validation helpers with specific Dutch messages: which field, on which tab,
// what is wrong and how to fix it. Sanity's own messages ("Verplicht",
// "Maximaal 160 tekens") don't say where the problem is.

interface RuleLike<R> {
  custom(fn: CustomValidator<any>): R;
  warning(message?: string): R;
  error(message?: string): R;
}

type Validation = <R extends RuleLike<R>>(rule: R) => R;

const isObjectType = (type: SchemaType | undefined): type is ObjectSchemaType =>
  Boolean(type && "fields" in type && Array.isArray((type as ObjectSchemaType).fields));

const isArrayType = (type: SchemaType | undefined): type is SchemaType & { of: SchemaType[] } =>
  Boolean(type && "of" in type && Array.isArray((type as { of?: unknown }).of));

/** "“Blokken › nr. 3 › Kop (NL)” (tab Blokken)" for the field being validated. */
function waar(ctx: ValidationContext): string {
  const path = ctx.path ?? [];
  const docType = ctx.document ? ctx.schema.get(ctx.document._type) : undefined;
  const parts: string[] = [];
  let type: SchemaType | undefined = docType;
  let value: unknown = ctx.document;

  for (const segment of path) {
    if (typeof segment === "string" && isObjectType(type)) {
      const field: ObjectSchemaType["fields"][number] | undefined = type.fields.find((f) => f.name === segment);
      type = field?.type;
      parts.push(field?.type.title || segment);
      value = (value as Record<string, unknown> | undefined)?.[segment];
    } else if (isArrayType(type)) {
      const items = Array.isArray(value) ? value : [];
      const index =
        typeof segment === "number"
          ? segment
          : items.findIndex((item) => item?._key === (segment as { _key?: string })._key);
      const item = items[index];
      parts.push(`nr. ${index + 1}`);
      type = type.of.find((t) => t.name === item?._type) ?? type.of[0];
      value = item;
    }
  }

  const label = parts.length ? parts.join(" › ") : ctx.type?.title || "Dit veld";
  let tab = "";
  if (isObjectType(docType) && typeof path[0] === "string") {
    const field = docType.fields.find((f) => f.name === path[0]) as { group?: string | string[] } | undefined;
    const groupName = Array.isArray(field?.group) ? field?.group[0] : field?.group;
    const group = (docType as { groups?: { name: string; title?: string }[] }).groups?.find((g) => g.name === groupName);
    if (group?.title) tab = ` (tab ${group.title})`;
  }
  return `“${label}”${tab}`;
}

const isEmpty = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    const v = value as { _type?: string; asset?: unknown; _ref?: string };
    if ((v._type === "image" || v._type === "file") && !v.asset) return true;
    if (v._type === "reference" && !v._ref) return true;
  }
  return false;
};

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;

type Check<T> = (value: T, ctx: ValidationContext) => string | true;

/**
 * One custom check with an explicit level. With `waarom` it becomes a warning
 * (shown, but publishing still works) and the reason is added to the message.
 * The level must be set explicitly: some field types (slug) default to warning.
 * Hidden fields are skipped: Julie can't fix what she can't see.
 */
const regel =
  <T>(check: Check<T>, waarom?: string): Validation =>
  (rule) => {
    const checked = rule.custom((value: T, ctx) => {
      if (ctx.hidden) return true;
      const result = check(value, ctx);
      return result === true || !waarom ? result : `${result} ${waarom}`;
    });
    return waarom ? checked.warning() : checked.error();
  };

export const verplicht: Validation = regel<unknown>((value, ctx) =>
  isEmpty(value) ? `${waar(ctx)} is nog leeg. Vul het in om te kunnen publiceren.` : true,
);

/**
 * Max characters. Pass `waarom` to make it a warning instead of a publish
 * blocker; `tenzijBoven` silences the warning when a hard limit already fires.
 */
export const maxTekens = (max: number, waarom?: string, tenzijBoven = Infinity): Validation =>
  regel<string | undefined>((value, ctx) => {
    if (typeof value !== "string" || value.length <= max || value.length > tenzijBoven) return true;
    const teveel = value.length - max;
    return `${waar(ctx)} is ${value.length} tekens, maximaal ${max}. Haal er ${meervoud(teveel, "teken", "tekens")} af.`;
  }, waarom);

/** SEO title: blocks above 70, warns above 60. */
export const googleTitel = <R extends RuleLike<R>>(rule: R): R[] => [
  maxTekens(70)(rule),
  maxTekens(60, GOOGLE_TITEL, 70)(rule),
];

export const maxItems = (max: number, waarom?: string): Validation =>
  regel<unknown[] | undefined>((value, ctx) => {
    if (!Array.isArray(value) || value.length <= max) return true;
    return `${waar(ctx)} heeft ${value.length} items, maximaal ${max}. Verwijder er ${value.length - max}.`;
  }, waarom);

export const minItems = (min: number): Validation =>
  regel<unknown[] | undefined>((value, ctx) => {
    const n = Array.isArray(value) ? value.length : 0;
    if (n >= min) return true;
    return n === 0
      ? `${waar(ctx)}: er is nog niets gekozen. Kies er minstens ${min}.`
      : `${waar(ctx)} heeft er ${n}, minstens ${min} nodig. Voeg er ${min - n} toe.`;
  });

/** Same reference or value twice in a list. */
export const uniek: Validation = regel<unknown[] | undefined>((value, ctx) => {
  if (!Array.isArray(value)) return true;
  const seen = new Set<string>();
  for (const [i, item] of value.entries()) {
    const id = typeof item === "object" && item ? ((item as { _ref?: string })._ref ?? JSON.stringify(item)) : String(item);
    if (seen.has(id)) return `${waar(ctx)}: nr. ${i + 1} staat er al eerder in. Verwijder de dubbele.`;
    seen.add(id);
  }
  return true;
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const email = (waarom?: string): Validation =>
  regel<string | undefined>((value, ctx) =>
    !value || EMAIL.test(value.trim())
      ? true
      : `${waar(ctx)}: “${value}” is geen geldig e-mailadres. Schrijf het als naam@movenda.be.`,
  waarom);

const TIJD = /^([01]\d|2[0-3]):[0-5]\d$/;

export const tijd = (voorbeeld: string): Validation =>
  regel<string | undefined>((value, ctx) =>
    !value || TIJD.test(value) ? true : `${waar(ctx)}: “${value}” is geen geldig uur. Schrijf het als uu:mm, bv. ${voorbeeld}.`,
  );

/** Internal site path such as /training. */
export const pad: Validation = regel<string | undefined>((value, ctx) =>
  !value || value.startsWith("/") ? true : `${waar(ctx)}: “${value}” moet met / beginnen, bv. /${value.replace(/^\W+/, "")}.`,
);

/** Full web address. Use on `type: "string"`: a `url` field adds Sanity's own vague check. */
export const webadres: Validation = regel<string | undefined>((value, ctx) =>
  !value || /^https?:\/\/[^\s.]+\.\S+$/.test(value.trim())
    ? true
    : `${waar(ctx)}: “${value}” is geen volledig webadres. Kopieer de link uit je browser, die begint met https://.`,
);

/** Web, mail or site link: https://…, mailto:… or /pad. */
export const link: Validation = regel<string | undefined>((value, ctx) =>
  !value || /^(https?:\/\/\S+|mailto:\S+|\/\S*)$/.test(value.trim())
    ? true
    : `${waar(ctx)}: “${value}” is geen geldige link. Begin met https://, mailto: of /.`,
);

/** Adds the field location to a custom message: `metPlek(ctx, "plak de URL.")`. */
export const metPlek = (ctx: ValidationContext, boodschap: string) => `${waar(ctx)}: ${boodschap}`;

export const GOOGLE_TITEL = "Google toont maar ±60 tekens, de rest valt weg.";
export const GOOGLE_OMSCHRIJVING = "Google toont maar ±160 tekens, de rest valt weg.";
