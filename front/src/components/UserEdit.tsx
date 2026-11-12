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
import { DELEGATE_ROLES, roles } from "./roles";
import { AdminUserContext } from "./AdminUserContext";

export const UserEdit = () => {
  const t = useTranslate();
  const me = useContext(AdminUserContext);
  // Mirrors permissions.editable_roles; delegate roles are synced at login.
  const grantable = roles.map(({ id, name }) => ({
    id,
    name,
    disabled:
      DELEGATE_ROLES.includes(id) ||
      (id === "GLOBAL_ADMIN" && !me?.roles.includes("GLOBAL_ADMIN")),
  }));

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
