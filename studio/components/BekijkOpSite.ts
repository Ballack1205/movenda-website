import { LaunchIcon } from "@sanity/icons";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { createElement } from "react";
import type { InputProps } from "sanity";
import { resolvePreviewUrl } from "../preview";
import { EN_TAB_NOTE } from "../schemaTypes/helpers";

// Wraps the root input of every document: a visible "Bekijk op de site" bar
// above the form, so Julie sees where this record lands without the ⋮ menu.
export function withBekijkOpSite(props: InputProps) {
  // On any "English" tab (document or section), say once what empty means.
  const groups = (props as { groups?: { name: string; selected?: boolean }[] }).groups;
  const enNote = groups?.some((g) => g.name === "en" && g.selected)
    ? createElement(
        Card,
        { padding: 3, radius: 2, tone: "transparent", border: true },
        createElement(Text, { size: 1, muted: true }, EN_TAB_NOTE),
      )
    : null;
  const value = props.value as { _type?: string } | undefined;
  const isRoot = props.path.length === 0;
  const url = isRoot && value?._type ? resolvePreviewUrl(value) : undefined;
  if (!url) {
    return enNote
      ? createElement(Stack, { space: 4 }, enNote, props.renderDefault(props))
      : props.renderDefault(props);
  }

  return createElement(
    Stack,
    { space: 4 },
    createElement(
      Card,
      { padding: 3, radius: 2, tone: "primary", border: true },
      createElement(
        Flex,
        { align: "center", gap: 3, wrap: "wrap" },
        createElement(
          Stack,
          { space: 2, flex: 1 },
          createElement(Text, { size: 1, weight: "semibold" }, "Waar staat dit op de site?"),
          createElement(
            Text,
            { size: 1, muted: true },
            "De site toont de gepubliceerde versie, een paar minuten na Publiceren.",
          ),
        ),
        createElement(Button, {
          as: "a",
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          mode: "default",
          tone: "primary",
          fontSize: 1,
          padding: 3,
          icon: LaunchIcon,
          text: "Bekijk op de site",
        }),
      ),
    ),
    enNote,
    props.renderDefault(props),
  );
}
