import {
  AutocompleteArrayInput,
  choices,
  Edit,
  SelectInput,
  SimpleForm,
  useTranslate,
} from "react-admin";
import { Province, provinceID } from "./Types";
import { getProvincesWithNA } from "./Provinces";
import { roles } from "./Roles";

const provinces: Province[] = getProvincesWithNA();
const provincesIds: provinceID[] = provinces.map((province) => province.id);
const validateProvince = choices(
  provincesIds,
  "Please choose one of the values",
);
export const UserEdit = () => {
  const t = useTranslate();

  return (
    <Edit>
      <SimpleForm>
        <SelectInput
          label="Province"
          source="province"
          choices={provinces}
          optionText={(option) => t("translation.provinces." + option.id)}
          optionValue="id"
          validate={validateProvince}
        />

        <AutocompleteArrayInput
          source="roles"
          choices={roles}
          optionValue="id"
          optionText={(option) => t("translation.account.role." + option.id)}
        />
      </SimpleForm>
    </Edit>
  );
};
