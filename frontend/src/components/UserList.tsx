import {useMediaQuery, Theme} from "@mui/material";
import {Datagrid, DateField, List, ReferenceInput, SimpleList, TextField, TextInput, EditButton} from 'react-admin';

export const UserList = () => {
    const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

    const userFilters = [
        <TextInput source="q" label="Search" alwaysOn/>,
    ];

    return (
        <List filters={userFilters}>
            {isSmall ? (
                <SimpleList
                    primaryText={(record) => record.name}
                    secondaryText={(record) => record.id}
                    tertiaryText={(record) => record.province}
                />
            ) : (
                <Datagrid rowClick="edit">
                    <TextField source="id"/>
                    <TextField source="name"/>
                    <TextField source="province"/>
                    <TextField source="roles"/>
                    <TextField source="wca_person"/>
                    <DateField source="dob"/>
                    <EditButton />
                </Datagrid>
            )}
        </List>
    );
}