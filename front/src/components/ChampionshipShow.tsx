import {
  BooleanField,
  DateField,
  FunctionField,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
} from "react-admin";

export const ChampionshipShow = () => {
  const translate = useTranslate();
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="competition_name" />
        <TextField source="competition_id" />
        <NumberField source="year" />
        <FunctionField
          source="type"
          render={(record) =>
            record.type
              ? translate(`resources.ChampionshipsAdmin.types.${record.type}`)
              : ""
          }
        />
        <TextField source="area" />
        <FunctionField
          source="region"
          render={(record) =>
            record.region
              ? translate(`translation.regions.${record.region}`)
              : ""
          }
        />
        <FunctionField
          source="province"
          render={(record) =>
            record.province
              ? translate(`translation.provinces.${record.province}`)
              : ""
          }
        />
        <BooleanField source="is_pbq" />
        <BooleanField source="is_fmc" />
        <DateField source="residency_deadline" showTime />
        <TextField source="residency_timezone" />
      </SimpleShowLayout>
    </Show>
  );
};
