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
      S.documentTypeListItem("popup").title("Pop-ups"),
      S.divider(),
      S.documentTypeListItem("teamlid").title("Teamleden"),
      S.documentTypeListItem("locatie").title("Locaties"),
      S.documentTypeListItem("dienst").title("Diensten"),
      S.documentTypeListItem("prijsitem").title("Prijzen"),
      S.documentTypeListItem("partner").title("Partners & logo's"),
      S.documentTypeListItem("faq").title("FAQ"),
      S.documentTypeListItem("getuigenis").title("Getuigenissen"),
      S.documentTypeListItem("blogPost").title("Blogposts"),
      S.documentTypeListItem("vacature").title("Vacatures"),
      S.documentTypeListItem("sportaanbodItem").title("Olympia sportaanbod"),
    ]);
