import { defineField, defineType } from "sanity";

export default defineType({
  name: "googleReviewInfo",
  title: "Google-reviewgegevens",
  type: "object",
  fields: [
    defineField({ name: "rating", title: "Score (bv. 5.0)", type: "number" }),
    defineField({ name: "count", title: "Aantal reviews (bv. '30+')", type: "string" }),
    defineField({ name: "reviewUrl", title: "Link naar de reviews", type: "url" }),
    defineField({ name: "writeReviewUrl", title: "Link om een review te schrijven", type: "url" }),
  ],
});
