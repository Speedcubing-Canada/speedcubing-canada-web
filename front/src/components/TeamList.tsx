import { useContext } from "react";
import { useMediaQuery, Theme } from "@mui/material";
import {
  Datagrid,
  EditButton,
  List,
  NumberField,
  SearchInput,
  SimpleList,
  TextField,
} from "react-admin";
import { AdminUserContext } from "./AdminUserContext";
import { canManageUsers } from "./roles";

export const TeamList = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const full = canManageUsers(useContext(AdminUserContext));
  const filters = [<SearchInput key="q" source="q" alwaysOn />];

  return (
    <List filters={filters} sort={{ field: "position", order: "ASC" }}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.name_en ?? record.id}
          secondaryText={(record) => record.name_fr ?? ""}
          tertiaryText={(record) => `${record.members?.length ?? 0}`}
        />
      ) : (
        <Datagrid rowClick="show" bulkActionButtons={full ? undefined : false}>
          <TextField source="id" />
          <TextField source="name_en" />
          <TextField source="name_fr" />
          <NumberField source="position" />
          <EditButton />
        </Datagrid>
      )}
    </List>
  );
};
