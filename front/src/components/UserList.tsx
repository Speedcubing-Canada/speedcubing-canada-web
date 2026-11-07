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
import { useResponsiveQuery } from "./useResponsiveQuery";

export const UserList = () => {
  const isSmall = useResponsiveQuery("sm");

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
