import {
  Datagrid,
  EditButton,
  List,
  NumberField,
  SearchInput,
  SimpleList,
  TextField,
} from "react-admin";
import { useResponsiveQuery } from "./useResponsiveQuery";

// Shared list for DirectorsAdmin / FeaturedMembersAdmin.
export const PersonList = () => {
  const isSmall = useResponsiveQuery("sm");
  const filters = [<SearchInput key="q" source="q" alwaysOn />];

  return (
    <List filters={filters} sort={{ field: "position", order: "ASC" }}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.name ?? record.id}
          secondaryText={(record) => record.role_en ?? ""}
        />
      ) : (
        <Datagrid rowClick="show">
          <TextField source="name" />
          <TextField source="role_en" />
          <NumberField source="position" />
          <EditButton />
        </Datagrid>
      )}
    </List>
  );
};
