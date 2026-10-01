import { useValidationStatus, type DocumentActionComponent } from "sanity";
import { Stack, Text } from "@sanity/ui";

// Sanity's disabled Publiceren button only says "Er zijn validatiefouten…".
// This keeps the original action and lists the actual problems in its tooltip.
export const withErrorList = (Publish: DocumentActionComponent): DocumentActionComponent => {
  const Wrapped: DocumentActionComponent = (props) => {
    const description = Publish(props);
    const { validation } = useValidationStatus(props.draft?._id ?? props.id, props.type, !props.release);
    const errors = validation.filter((marker) => marker.level === "error");
    if (!description || errors.length === 0) return description;
    return {
      ...description,
      title: (
        <Stack space={3} padding={2} style={{ maxWidth: 360 }}>
          <Text size={1} weight="semibold">
            Nog niet te publiceren. Los dit eerst op:
          </Text>
          {errors.map((marker, i) => (
            <Text key={i} size={1}>
              • {marker.message}
            </Text>
          ))}
          <Text size={1} muted>
            Tip: klik op het rode uitroepteken bovenaan om meteen naar het veld te springen.
          </Text>
        </Stack>
      ),
    };
  };
  Wrapped.action = Publish.action;
  Wrapped.displayName = "PublishWithErrorList";
  return Wrapped;
};
