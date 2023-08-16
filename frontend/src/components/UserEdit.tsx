import {AutocompleteArrayInput, choices, Edit, SelectInput, SimpleForm, TextInput} from 'react-admin';
import {Province, provinceID} from "./Types";
import {getProvincesWithNA} from "./Provinces";
import {roles} from "./Roles";

const provinces: Province[] = getProvincesWithNA();
const provincesIds: provinceID[] = provinces.map(province => province.id);
const validateProvince = choices(provincesIds, 'Please choose one of the values');
export const UserEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <SelectInput label="Province" source="province" choices={provinces}
                             optionText="label" optionValue="id"
                             validate={validateProvince}/>

                <AutocompleteArrayInput source="roles" choices={roles}
                optionText="name" optionValue="id"/>
            </SimpleForm>
        </Edit>
    );
}