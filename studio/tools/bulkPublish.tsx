import { useCallback, useEffect, useMemo, useState } from "react";
import { Preview, useClient, useSchema, useValidationStatus, type Tool } from "sanity";
import { Box, Button, Card, Checkbox, Flex, Spinner, Stack, Text } from "@sanity/ui";
import { PublishIcon } from "@sanity/icons";

// Julie's "publish everything at once". Sanity's own Content Releases is an
// Enterprise add-on, so this publishes the selected drafts in one transaction.
// Drafts with validation errors are skipped, like the normal Publiceren button.

type Draft = { _id: string; _type: string; _updatedAt: string };
type Status = "idle" | "confirm" | "publishing" | "done" | "error";

const publishedId = (id: string) => id.replace(/^drafts\./, "");

function DraftRow({
  draft,
  checked,
  onToggle,
  onValidity,
}: {
  draft: Draft;
  checked: boolean;
  onToggle: (id: string) => void;
  onValidity: (id: string, ok: boolean | undefined) => void;
}) {
  const schema = useSchema();
  const schemaType = schema.get(draft._type);
  const { validation, isValidating } = useValidationStatus(draft._id, draft._type, true);
  const errors = validation.filter((marker) => marker.level === "error");
  const ok = isValidating ? undefined : errors.length === 0;

  useEffect(() => {
    onValidity(draft._id, ok);
  }, [draft._id, ok, onValidity]);

  if (!schemaType) return null;

  return (
    <Card padding={3} radius={2} border tone={ok === false ? "critical" : "default"}>
      <Flex align="center" gap={3}>
        <Checkbox checked={checked && ok === true} disabled={ok !== true} onChange={() => onToggle(draft._id)} />
        <Box flex={1}>
          <Preview schemaType={schemaType} value={{ _id: draft._id, _type: draft._type }} layout="default" />
        </Box>
        <Stack space={2} style={{ minWidth: "11rem", textAlign: "right" }}>
          <Text size={1} muted>
            {schemaType.title || draft._type}
          </Text>
          <Text size={1} muted>
            {isValidating
              ? "Controleren…"
              : ok
                ? `Gewijzigd ${new Date(draft._updatedAt).toLocaleString("nl-BE", { dateStyle: "short", timeStyle: "short" })}`
                : "Niet klaar: open het document en los de rode velden op"}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}

function BulkPublish() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const schema = useSchema();
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());
  const [validity, setValidity] = useState<Record<string, boolean | undefined>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setDrafts(null);
    const rows = await client.fetch<Draft[]>(
      `*[_id in path("drafts.**")] | order(_updatedAt desc) { _id, _type, _updatedAt }`,
    );
    setDrafts(rows.filter((row) => schema.get(row._type)));
    setUnchecked(new Set());
    setValidity({});
  }, [client, schema]);

  useEffect(() => {
    void load();
  }, [load]);

  const onValidity = useCallback((id: string, ok: boolean | undefined) => {
    setValidity((prev) => (prev[id] === ok ? prev : { ...prev, [id]: ok }));
  }, []);

  const toggle = useCallback((id: string) => {
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selected = useMemo(
    () => (drafts || []).filter((draft) => validity[draft._id] === true && !unchecked.has(draft._id)),
    [drafts, validity, unchecked],
  );
  const stillChecking = (drafts || []).some((draft) => validity[draft._id] === undefined);

  const publish = async () => {
    setStatus("publishing");
    try {
      const ids = selected.map((draft) => draft._id);
      const docs = await client.fetch<Record<string, unknown>[]>(`*[_id in $ids]`, { ids });
      const tx = client.transaction();
      for (const doc of docs) {
        const { _id, _rev, _updatedAt, ...rest } = doc as { _id: string; _rev?: string; _updatedAt?: string };
        tx.createOrReplace({ ...rest, _id: publishedId(_id) } as { _id: string; _type: string });
        tx.delete(_id);
      }
      await tx.commit({ visibility: "async" });
      setStatus("done");
      setMessage(
        `${docs.length} ${docs.length === 1 ? "document" : "documenten"} gepubliceerd. De site staat over een à twee minuten bij.`,
      );
      await load();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Box padding={4} style={{ maxWidth: 960, margin: "0 auto" }}>
      <Stack space={4}>
        <Stack space={3}>
          <Text size={4} weight="semibold">
            Alles publiceren
          </Text>
          <Text muted>
            Alle concepten die nog niet online staan. Vink uit wat nog niet mag verschijnen, en publiceer de rest in één
            keer. Concepten met rode velden worden overgeslagen tot je ze oplost.
          </Text>
        </Stack>

        {message && (
          <Card padding={3} radius={2} tone={status === "error" ? "critical" : "positive"}>
            <Text size={1}>{message}</Text>
          </Card>
        )}

        {drafts === null ? (
          <Flex justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : drafts.length === 0 ? (
          <Card padding={4} radius={2} border>
            <Text muted>Er staan geen concepten klaar. Alles is gepubliceerd.</Text>
          </Card>
        ) : (
          <Stack space={2}>
            {drafts.map((draft) => (
              <DraftRow
                key={draft._id}
                draft={draft}
                checked={!unchecked.has(draft._id)}
                onToggle={toggle}
                onValidity={onValidity}
              />
            ))}
          </Stack>
        )}

        {drafts && drafts.length > 0 && (
          <Card padding={3} radius={2} border tone={status === "confirm" ? "caution" : "default"}>
            {status === "confirm" ? (
              <Flex align="center" gap={3} wrap="wrap">
                <Box flex={1}>
                  <Text>
                    Zeker? Dit zet {selected.length} {selected.length === 1 ? "document" : "documenten"} meteen online.
                  </Text>
                </Box>
                <Button mode="ghost" text="Annuleren" onClick={() => setStatus("idle")} />
                <Button tone="positive" icon={PublishIcon} text="Ja, publiceren" onClick={publish} />
              </Flex>
            ) : (
              <Flex align="center" gap={3} wrap="wrap">
                <Box flex={1}>
                  <Text size={1} muted>
                    {stillChecking ? "Concepten worden gecontroleerd…" : `${selected.length} van ${drafts.length} geselecteerd`}
                  </Text>
                </Box>
                <Button mode="ghost" text="Vernieuwen" onClick={() => void load()} disabled={status === "publishing"} />
                <Button
                  tone="positive"
                  icon={PublishIcon}
                  text={status === "publishing" ? "Bezig…" : `${selected.length} publiceren`}
                  disabled={selected.length === 0 || stillChecking || status === "publishing"}
                  onClick={() => {
                    setMessage("");
                    setStatus("confirm");
                  }}
                />
              </Flex>
            )}
          </Card>
        )}
      </Stack>
    </Box>
  );
}

export const bulkPublishTool: Tool = {
  name: "alles-publiceren",
  title: "Alles publiceren",
  icon: PublishIcon,
  component: BulkPublish,
};
