import { defineArrayMember, defineType } from "sanity";
import { link } from "./regels";

// The one rich-text editor for running copy (bio, service text, page text).
// Julie gets bold, italic, a link and three sizes: Normaal, Groot, Klein.
// There are no free font sizes or colours on purpose: the layout stays ours,
// so the site keeps one look however the text is formatted.
export default defineType({
  name: "richText",
  title: "Tekst",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normaal", value: "normal" },
        { title: "Groot", value: "groot" },
        { title: "Klein", value: "klein" },
      ],
      lists: [],
      marks: {
        decorators: [
          { title: "Vet", value: "strong" },
          { title: "Cursief", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "string",
                title: "Link",
                description: "https://…, mailto:… of /pad op de site.",
                validation: link,
              },
            ],
          },
        ],
      },
    }),
  ],
});
