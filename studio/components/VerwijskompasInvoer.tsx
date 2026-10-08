import { useEffect, useMemo, useState } from "react";
import { set, useClient, type ObjectInputProps } from "sanity";
import { Box, Button, Card, Checkbox, Flex, Spinner, Stack, Text, TextInput } from "@sanity/ui";

// Two ways to edit the same colleague assignments on the compass document.
// "Per keuze" is the normal field list. "Per persoon" ticks choices onto one
// teammate. Both write the collegas arrays, so Publish saves either view.

type Verwijzing = { _key?: string; _ref?: string; _type?: string; _weak?: boolean };
type Stap = { _key?: string; label?: string; vervolg?: string; collegas?: Verwijzing[] | null };
type Kompas = {
  klachten?: Stap[] | null;
  regios?: Stap[] | null;
  sporten?: Stap[] | null;
  training?: Stap[] | null;
};
type Groep = keyof Kompas;
type Teamlid = { _id: string; voornaam?: string; naam?: string; actief?: boolean };

const GROEPEN: { veld: Groep; titel: string }[] = [
  { veld: "klachten", titel: "Kine: waarvoor kom je?" },
  { veld: "regios", titel: "Kine: waar zit de klacht?" },
  { veld: "sporten", titel: "Kine: welke sport?" },
  { veld: "training", titel: "Training & coaching" },
];

function nieuweSleutel() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function stappenVoorPersonen(stappen: Stap[] | null | undefined) {
  return (stappen || []).filter((stap) => stap._key && stap.label && stap.vervolg !== "regio" && stap.vervolg !== "sport");
}

function heeftPersoon(stap: Stap, persoonId: string) {
  return (stap.collegas || []).some((ref) => ref._ref === persoonId);
}

function Modus({ modus, onKies }: { modus: "keuze" | "persoon"; onKies: (modus: "keuze" | "persoon") => void }) {
  return (
    <Card padding={3} radius={2} border>
      <Stack space={3}>
        <Text size={1} weight="semibold">
          Toewijzen
        </Text>
        <Flex gap={2} wrap="wrap">
          <Button
            text="Per keuze"
            mode={modus === "keuze" ? "default" : "ghost"}
            tone={modus === "keuze" ? "primary" : "default"}
            onClick={() => onKies("keuze")}
          />
          <Button
            text="Per persoon"
            mode={modus === "persoon" ? "default" : "ghost"}
            tone={modus === "persoon" ? "primary" : "default"}
            onClick={() => onKies("persoon")}
          />
        </Flex>
        <Text size={1} muted>
          {modus === "keuze"
            ? "Open een rij en kies de collega's. Sleep de rijen voor de volgorde op de site. Daarna Publiceren."
            : "Kies een collega en vink aan bij welke keuzes die hoort. Dat is dezelfde toewijzing. Daarna Publiceren."}
        </Text>
      </Stack>
    </Card>
  );
}

function PerPersoon({
  kompas,
  onChange,
  readOnly,
}: {
  kompas: Kompas;
  onChange: ObjectInputProps["onChange"];
  readOnly?: boolean;
}) {
  const client = useClient({ apiVersion: "2026-01-01" });
  const [team, setTeam] = useState<Teamlid[] | null>(null);
  const [fout, setFout] = useState(false);
  const [zoek, setZoek] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let geldig = true;
    client
      .fetch<Teamlid[]>(
        `*[_type == "teamlid" && !(_id in path("drafts.**"))] | order(voornaam asc) { _id, voornaam, naam, actief }`,
      )
      .then((rijen) => {
        if (geldig) setTeam(rijen);
      })
      .catch(() => {
        if (geldig) setFout(true);
      });
    return () => {
      geldig = false;
    };
  }, [client]);

  const labelsPerPersoon = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const groep of GROEPEN) {
      for (const stap of stappenVoorPersonen(kompas[groep.veld])) {
        for (const ref of stap.collegas || []) {
          if (!ref._ref || !stap.label) continue;
          const lijst = map.get(ref._ref) || [];
          lijst.push(stap.label);
          map.set(ref._ref, lijst);
        }
      }
    }
    return map;
  }, [kompas]);

  const zichtbaar = (team || []).filter((lid) => {
    const naam = `${lid.voornaam || ""} ${lid.naam || ""}`.toLowerCase();
    return naam.includes(zoek.trim().toLowerCase());
  });

  function zet(veld: Groep, stapKey: string, persoonId: string, aan: boolean) {
    const stap = (kompas[veld] || []).find((item) => item._key === stapKey);
    if (!stap) return;
    const huidig = stap.collegas || [];
    const al = huidig.some((ref) => ref._ref === persoonId);
    if (aan === al) return;
    const volgend = aan
      ? [...huidig, { _key: nieuweSleutel(), _type: "reference", _ref: persoonId, _weak: true }]
      : huidig.filter((ref) => ref._ref !== persoonId);
    onChange(set(volgend, [veld, { _key: stapKey }, "collegas"]));
  }

  if (fout) {
    return <Text size={1}>De collega's konden niet geladen worden. Herlaad de Studio.</Text>;
  }
  if (!team) {
    return (
      <Flex align="center" gap={3} padding={3}>
        <Spinner />
        <Text size={1} muted>
          Collega's laden…
        </Text>
      </Flex>
    );
  }

  return (
    <Stack space={4}>
      <TextInput
        placeholder="Zoek een collega"
        value={zoek}
        onChange={(event) => setZoek(event.currentTarget.value)}
      />
      {zichtbaar.length === 0 ? (
        <Text size={1} muted>
          Geen collega met die naam.
        </Text>
      ) : (
        zichtbaar.map((lid) => {
          const naam = `${lid.voornaam || ""} ${lid.naam || ""}`.trim();
          const labels = labelsPerPersoon.get(lid._id) || [];
          const open = openId === lid._id;
          const kort = labels.length > 6 ? `${labels.slice(0, 6).join(", ")} en nog ${labels.length - 6}` : labels.join(", ");
          return (
            <Card key={lid._id} padding={3} radius={2} border tone={open ? "primary" : "default"}>
              <Stack space={3}>
                <Button
                  mode="bleed"
                  tone="default"
                  width="fill"
                  justify="flex-start"
                  text={naam || lid._id}
                  onClick={() => setOpenId(open ? null : lid._id)}
                />
                <Text size={1} muted>
                  {lid.actief === false ? "Verborgen op de site. " : ""}
                  {kort || "Nog bij geen enkele keuze"}
                </Text>
                {open &&
                  GROEPEN.map((groep) => {
                    const stappen = stappenVoorPersonen(kompas[groep.veld]);
                    if (!stappen.length) return null;
                    return (
                      <Stack key={groep.veld} space={3}>
                        <Text size={1} weight="semibold">
                          {groep.titel}
                        </Text>
                        <Box style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                          {stappen.map((stap) => {
                            const aan = heeftPersoon(stap, lid._id);
                            return (
                              <Flex
                                as="label"
                                key={stap._key}
                                align="center"
                                gap={2}
                                style={{ cursor: readOnly ? "default" : "pointer" }}
                              >
                                <Checkbox
                                  checked={aan}
                                  disabled={readOnly}
                                  onChange={(event) => zet(groep.veld, stap._key as string, lid._id, event.currentTarget.checked)}
                                />
                                <Text size={1}>{stap.label}</Text>
                              </Flex>
                            );
                          })}
                        </Box>
                      </Stack>
                    );
                  })}
              </Stack>
            </Card>
          );
        })
      )}
    </Stack>
  );
}

export function VerwijskompasInvoer(props: ObjectInputProps) {
  const [modus, setModus] = useState<"keuze" | "persoon">("keuze");
  const kompas = (props.value || {}) as Kompas;

  return (
    <Stack space={4}>
      <Modus modus={modus} onKies={setModus} />
      {modus === "keuze" ? (
        props.renderDefault(props)
      ) : (
        <PerPersoon kompas={kompas} onChange={props.onChange} readOnly={props.readOnly} />
      )}
    </Stack>
  );
}
