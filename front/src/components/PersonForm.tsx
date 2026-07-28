import { NumberInput, TextInput, required, useTranslate } from "react-admin";
import { WcaPersonSearchInput } from "./WcaPersonSearchInput";

// Shared input set for the flat "site person" resources (DirectorsAdmin,
// FeaturedMembersAdmin). react-admin scopes field labels to the active resource, so the
// same component serves both. The `id` slug is the stable key, editable only on create.
export const PersonInputs = ({ create }: { create?: boolean }) => {
  const t = useTranslate();
  return (
    <>
      <TextInput
        source="id"
        disabled={!create}
        validate={create ? required() : undefined}
        helperText={t("resources.person.id_help")}
      />
      <WcaPersonSearchInput
        source="wca_id"
        helperText={t("resources.person.wca_id_help")}
      />
      <TextInput source="name" validate={required()} />
      <TextInput source="role_en" />
      <TextInput source="role_fr" />
      <TextInput source="bio_en" multiline fullWidth />
      <TextInput source="bio_fr" multiline fullWidth />
      <NumberInput source="position" defaultValue={0} />
    </>
  );
};
