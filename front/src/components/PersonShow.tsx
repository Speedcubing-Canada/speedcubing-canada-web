import { NumberField, Show, SimpleShowLayout, TextField } from "react-admin";

export const PersonShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="wca_id" />
      <TextField source="role_en" />
      <TextField source="role_fr" />
      <TextField source="bio_en" />
      <TextField source="bio_fr" />
      <NumberField source="position" />
    </SimpleShowLayout>
  </Show>
);
