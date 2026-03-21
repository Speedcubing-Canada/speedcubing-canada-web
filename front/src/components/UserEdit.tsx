import {
  AutocompleteArrayInput,
  choices,
  Edit,
  SelectInput,
  SimpleForm,
  useTranslate,
} from "react-admin";
import { Province, ProvinceID } from "../types";
import { getProvincesWithNA } from "./provinces";
import { roles } from "./roles";

export const UserEdit = () => {
  const t = useTranslate();

  return (
    <Edit>
      <SimpleForm>
        <SelectInput
          label="Province"
          source="province"
          choices={provinces}
          optionText={(option) => t(`translation.provinces.${option.id}`)}
          optionValue="id"
          validate={validateProvince}
        />

        <AutocompleteArrayInput
          source="roles"
          choices={roles}
          optionValue="id"
          optionText={(option) => t(`translation.account.role.${option.id}`)}
        />
      </SimpleForm>
    </Edit>
  );
};

const provinces: Province[] = getProvincesWithNA();
const provincesIds: ProvinceID[] = provinces.map((province) => province.id);
const validateProvince = choices(
  provincesIds,
  "Please choose one of the values",
);
