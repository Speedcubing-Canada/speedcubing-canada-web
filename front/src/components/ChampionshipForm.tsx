import {
  BooleanInput,
  DateTimeInput,
  FormDataConsumer,
  required,
  SelectInput,
  TextInput,
  useTranslate,
} from "react-admin";
import { REGIONS } from "../types";
import { getProvinces } from "./provinces";

const CHAMPIONSHIP_TYPE_CHOICES = [
  { id: "national" },
  { id: "national_fmc" },
  { id: "regional" },
  { id: "provincial" },
];

const regionChoices = (Object.keys(REGIONS) as string[])
  .filter((id) => id !== "na")
  .map((id) => ({ id }));

const provinceChoices = getProvinces().map((p) => ({ id: p.id }));

// Shared input set for ChampionshipCreate / ChampionshipEdit. Labels come from the
// react-admin field i18n (resources.ChampionshipsAdmin.fields.*); choices and the
// strings that have no field equivalent are translated explicitly. Region/province
// names reuse the public `translation.*` keys, like UserEdit does.
export const ChampionshipInputs = () => {
  const t = useTranslate();
  return (
    <>
      <TextInput
        source="competition_id"
        helperText={t("resources.ChampionshipsAdmin.form.competition_id_help")}
        validate={required()}
      />
      <SelectInput
        source="type"
        choices={CHAMPIONSHIP_TYPE_CHOICES}
        optionText={(choice) =>
          t(`resources.ChampionshipsAdmin.types.${choice.id}`)
        }
        validate={required()}
      />
      <FormDataConsumer>
        {({ formData }) =>
          formData.type === "regional" ? (
            <SelectInput
              source="region"
              choices={regionChoices}
              optionText={(choice) => t(`translation.regions.${choice.id}`)}
              validate={required()}
            />
          ) : formData.type === "provincial" ? (
            <SelectInput
              source="province"
              choices={provinceChoices}
              optionText={(choice) => t(`translation.provinces.${choice.id}`)}
              validate={required()}
            />
          ) : null
        }
      </FormDataConsumer>
      <BooleanInput
        source="is_pbq"
        label={t("resources.ChampionshipsAdmin.form.is_pbq")}
      />
      <BooleanInput
        source="is_fmc"
        label={t("resources.ChampionshipsAdmin.form.is_fmc")}
      />
      <DateTimeInput source="residency_deadline" />
      <TextInput
        source="residency_timezone"
        helperText={t(
          "resources.ChampionshipsAdmin.form.residency_timezone_help",
        )}
      />
    </>
  );
};
