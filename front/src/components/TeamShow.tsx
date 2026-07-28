import {
  ArrayField,
  BooleanField,
  Datagrid,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
} from "react-admin";

export const TeamShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name_en" />
      <TextField source="name_fr" />
      <TextField source="description_en" />
      <TextField source="description_fr" />
      <NumberField source="position" />
      <ArrayField source="members">
        <Datagrid bulkActionButtons={false}>
          <TextField source="name" />
          <TextField source="wca_id" />
          <BooleanField source="is_leader" />
          <TextField source="bio_en" />
          <TextField source="bio_fr" />
        </Datagrid>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);
