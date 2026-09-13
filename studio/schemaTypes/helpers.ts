// Shared Studio chrome for Julie: English stays optional and collapsed so
// the Dutch fields she uses every day stay on top.

export const EN_FIELDSET = {
  name: "en",
  title: "Engels (optioneel)",
  options: { collapsible: true, collapsed: true },
  description: "Leeg laten mag. De site toont dan de Nederlandse tekst.",
} as const;

export const SLUG_DESCRIPTION =
  "Klik 'Genereer' na het invullen van de naam. Alleen aanpassen als de URL écht anders moet.";
