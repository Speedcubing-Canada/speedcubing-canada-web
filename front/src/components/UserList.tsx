import { useMediaQuery, Theme } from "@mui/material";
import {
  Datagrid,
  List,
  SimpleList,
  TextField,
  SearchInput,
  EditButton,
  ArrayField,
} from "react-admin";
import { ProvinceField, UserRoleChip } from "./UserShow";

export const UserList = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  const userFilters = [<SearchInput source="q" alwaysOn />];

  return (
    <List filters={userFilters}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.name}
          secondaryText={(record) => record.id}
          tertiaryText={(record) => record.province}
        />
      ) : (
        <Datagrid rowClick="show">
          <TextField source="id" />
          <TextField source="name" />
          <ProvinceField source="province" />
          <ArrayField source="roles">
            <UserRoleChip />
          </ArrayField>
          <TextField source="wca_id" />
          <EditButton />
        </Datagrid>
      )}
    </List>
  );
};
