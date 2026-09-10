import type { StructureResolver } from "sanity/structure";

// Custom desk structure: siteSettings is a singleton (Julie should never
// be able to create a second one or delete the only one).
export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("Movenda")
    .items([
      S.listItem()
        .title("Site-instellingen")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("teamlid").title("Teamleden"),
      S.documentTypeListItem("locatie").title("Locaties"),
      S.documentTypeListItem("dienst").title("Diensten"),
    ]);
