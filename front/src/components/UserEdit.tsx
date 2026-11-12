import { useContext } from "react";
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
import { AdminUserContext } from "./AdminUserContext";

export const UserEdit = () => {
  const t = useTranslate();
  const me = useContext(AdminUserContext);
  // Only a global admin may grant GLOBAL_ADMIN; the backend ignores it otherwise.
  const grantable = roles.filter(
    (role) => role.id !== "GLOBAL_ADMIN" || me?.roles.includes("GLOBAL_ADMIN"),
  );

  return (
    <Edit>
      <SimpleForm>
        <SelectInput
          source="province"
          choices={provinces}
          optionText={(option) => t(`translation.provinces.${option.id}`)}
          optionValue="id"
          validate={validateProvince}
        />

        <AutocompleteArrayInput
          source="roles"
          choices={grantable}
          optionValue="id"
          optionText={(option) => t(`translation.account.role.${option.id}`)}
        />
      </SimpleForm>
    </Edit>
  );
};

const provinces: Province[] = getProvincesWithNA();
const provincesIds: ProvinceID[] = provinces.map((province) => province.id);
const validateProvince = choices(provincesIds);
