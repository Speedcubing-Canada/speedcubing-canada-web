import { useContext } from "react";
import {
  ArrayInput,
  BooleanInput,
  NumberInput,
  SimpleFormIterator,
  TextInput,
  required,
  useTranslate,
} from "react-admin";
import { WcaPersonSearchInput } from "./WcaPersonSearchInput";
import { AdminUserContext } from "./AdminUserContext";
import { isSiteAdmin } from "./roles";

// Shared input set for TeamCreate / TeamEdit. Labels resolve from the active resource's
// react-admin field i18n (resources.TeamsAdmin.fields.*). The `id` slug is the stable key
// used by imports/URLs, so it's editable only on create and locked on edit.
// Team leaders edit the roster only; every other field is locked for them.
export const TeamInputs = ({ create }: { create?: boolean }) => {
  const t = useTranslate();
  const full = isSiteAdmin(useContext(AdminUserContext));
  return (
    <>
      <TextInput
        source="id"
        disabled={!create}
        validate={create ? required() : undefined}
        helperText={t("resources.TeamsAdmin.form.id_help")}
      />
      <TextInput source="name_en" validate={required()} disabled={!full} />
      <TextInput source="name_fr" validate={required()} disabled={!full} />
      <TextInput source="description_en" multiline fullWidth disabled={!full} />
      <TextInput source="description_fr" multiline fullWidth disabled={!full} />
      <NumberInput source="position" defaultValue={0} disabled={!full} />
      <ArrayInput source="members">
        <SimpleFormIterator inline>
          <WcaPersonSearchInput source="wca_id" />
          <TextInput source="name" validate={required()} helperText={false} />
          <BooleanInput
            source="is_leader"
            helperText={false}
            disabled={!full}
          />
          <TextInput source="bio_en" multiline helperText={false} />
          <TextInput source="bio_fr" multiline helperText={false} />
        </SimpleFormIterator>
      </ArrayInput>
    </>
  );
};
