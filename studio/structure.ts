import type { StructureResolver } from "sanity/structure";
import {
  BillIcon,
  CalendarIcon,
  CaseIcon,
  CogIcon,
  CommentIcon,
  ComposeIcon,
  DocumentsIcon,
  EarthGlobeIcon,
  HelpCircleIcon,
  ImageIcon,
  PinIcon,
  RocketIcon,
  SearchIcon,
  TagIcon,
  UsersIcon,
} from "@sanity/icons";

// Julie's desk: daily work first, then people, then the offer, then copy.
// siteSettings + keuzehulp are singletons (no second document). Locaties
// are the two existing records — no "create new". Lesrooster was missing
// from the old flat list.

const teamOrder = [
  { field: "volgorde", direction: "asc" as const },
  { field: "naam", direction: "asc" as const },
];

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("Movenda")
    .items([
      S.listItem()
        .title("Site-instellingen")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.documentTypeListItem("popup").title("Pop-ups").icon(RocketIcon),
      S.divider(),

      S.listItem()
        .title("Teamleden")
        .icon(UsersIcon)
        .schemaType("teamlid")
        .child(
          S.documentTypeList("teamlid").title("Teamleden").defaultOrdering(teamOrder),
        ),
      S.documentTypeListItem("specialisatie").title("Specialisaties").icon(TagIcon),
      S.listItem()
        .title("Keuzehulp (Wie past bij mij?)")
        .icon(SearchIcon)
        .child(
          S.list()
            .title("Keuzehulp")
            .items([
              S.listItem()
                .title("Teksten & vragen")
                .child(S.document().schemaType("keuzehulp").documentId("keuzehulp")),
              S.documentTypeListItem("keuzehulpTag").title("Keuze-opties (tags)"),
            ]),
        ),
      S.divider(),

      S.listItem()
        .title("Locaties")
        .icon(PinIcon)
        .child(
          S.documentTypeList("locatie")
            .title("Locaties")
            .initialValueTemplates([]),
        ),
      S.documentTypeListItem("dienst").title("Diensten").icon(DocumentsIcon),
      S.listItem()
        .title("Lesrooster MPC")
        .icon(CalendarIcon)
        .schemaType("lesrooster")
        .child(
          S.documentTypeList("lesrooster")
            .title("Lesrooster MPC")
            .defaultOrdering([
              { field: "volgorde", direction: "asc" },
              { field: "dag", direction: "asc" },
              { field: "van", direction: "asc" },
            ]),
        ),
      S.documentTypeListItem("prijsitem").title("Prijzen").icon(BillIcon),
      S.documentTypeListItem("partner").title("Partners & logo's").icon(ImageIcon),
      S.divider(),

      S.documentTypeListItem("faq").title("FAQ").icon(HelpCircleIcon),
      S.documentTypeListItem("getuigenis").title("Getuigenissen").icon(CommentIcon),
      S.listItem()
        .title("Blogposts")
        .icon(ComposeIcon)
        .schemaType("blogPost")
        .child(
          S.documentTypeList("blogPost")
            .title("Blogposts")
            .defaultOrdering([{ field: "publicatiedatum", direction: "desc" }]),
        ),
      S.documentTypeListItem("vacature").title("Vacatures").icon(CaseIcon),
      S.documentTypeListItem("sportaanbodItem").title("Olympia sportaanbod").icon(EarthGlobeIcon),
    ]);
