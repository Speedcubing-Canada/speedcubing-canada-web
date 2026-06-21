import { useMediaQuery, Theme } from "@mui/material";
import {
  BooleanField,
  Datagrid,
  EditButton,
  FunctionField,
  List,
  NumberField,
  SimpleList,
  TextField,
  TextInput,
  useTranslate,
} from "react-admin";

export const ChampionshipList = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const translate = useTranslate();
  const typeLabel = (type: string) =>
    type ? translate(`resources.ChampionshipsAdmin.types.${type}`) : "";

  const filters = [<TextInput source="q" label="Search" alwaysOn />];

  return (
    <List filters={filters} sort={{ field: "year", order: "DESC" }}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.competition_name ?? record.id}
          secondaryText={(record) =>
            `${typeLabel(record.type)}${record.area ? ` · ${record.area}` : ""}`
          }
          tertiaryText={(record) => record.year}
        />
      ) : (
        <Datagrid rowClick="show">
          <TextField source="competition_name" />
          <NumberField source="year" />
          <FunctionField
            source="type"
            render={(record) => typeLabel(record.type)}
          />
          <TextField source="area" />
          <BooleanField source="is_pbq" />
          <EditButton />
        </Datagrid>
      )}
    </List>
  );
};
