import {
    ArrayField,
    ChipField,
    DateField,
    Show,
    SimpleShowLayout,
    SingleFieldList,
    TextField, useListContext, useRecordContext,
    WithListContext,
    WithRecord
} from 'react-admin';
import {getRoles} from "./Roles";
import {Province, Role} from "./Types";
import {getProvincesWithNA} from "./Provinces";
import {Link} from "@mui/material";
import {WCA_PROFILE_URL} from "../pages/Organization";
import LaunchIcon from "@mui/icons-material/Launch";

const provinces: Province[] = getProvincesWithNA();


const roles_list: Role[] = getRoles();
export const UserRoleChip = () => {
    const {data} = useListContext();
    const userRoles = data.map(roleId => {
        const role = roles_list.find(role => role.id === roleId);
        return role ? role.name : '';
    });

    return (
        <div>
            {userRoles.map((roleName, index) => (
                <ChipField key={index} record={{name: roleName}} source="name"/>
            ))}
        </div>
    );
};

const WcaProfileUrlField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    return record ? (
        <Link href={WCA_PROFILE_URL + record[source]} sx={{ textDecoration: "none" }}>
            {record[source]}
        </Link>
    ) : null;
};


export const ProvinceField = () => {
    const record = useRecordContext();
    const province: Province = provinces.find(item => item.id === record.province) || {
        label: 'Error',
        id: 'er',
        region: 'Error',
        region_id: 'er'
    };
    return <ChipField record={province} source="label"/>;
};
export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id"/>
            <TextField source="name"/>
            <ProvinceField />
            <ArrayField source="roles">
                <UserRoleChip/>
            </ArrayField>
            <DateField source="dob" label="Date of birth"/>
            <WcaProfileUrlField source="wca_person"/>
        </SimpleShowLayout>
    </Show>
);