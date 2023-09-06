import {
    ArrayField,
    ChipField,
    DateField, EmailField,
    Show,
    SimpleShowLayout,
    TextField, useListContext, useRecordContext, useTranslate,
} from 'react-admin';
import {Link} from "@mui/material";
import {WCA_PROFILE_URL} from "../pages/Organization";


export const UserRoleChip = () => {
    const t = useTranslate();
    const {data} = useListContext();
    return (
        <div>
            {data.map((roleId, index) => {
                const roleName = t('translation.account.role.' + roleId);
                return <ChipField key={index} record={{name: roleName}} source="name"/>;
            })}
        </div>
    );
};


const WcaProfileUrlField = ({source}: { source: string }) => {
    const record = useRecordContext();
    return record ? (
        <Link href={WCA_PROFILE_URL + record[source]} sx={{textDecoration: "none"}}>
            {record[source]}
        </Link>
    ) : null;
};


export const ProvinceField = ({source}: { source: string }) => {
    const t = useTranslate();
    const record = useRecordContext();
    const translatedLabel = t('translation.provinces.' + record[source]);

    return <ChipField record={{label: translatedLabel}} source="label"/>;
};

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id"/>
            <TextField source="name"/>
            <ProvinceField source="province"/>
            <ArrayField source="roles">
                <UserRoleChip/>
            </ArrayField>
            <DateField source="dob"/>
            <WcaProfileUrlField source="wca_person"/>
            <EmailField source="email" />
        </SimpleShowLayout>
    </Show>
);