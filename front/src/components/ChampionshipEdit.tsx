import { Edit, SimpleForm } from "react-admin";
import { ChampionshipInputs } from "./ChampionshipForm";

export const ChampionshipEdit = () => (
  <Edit>
    <SimpleForm>
      <ChampionshipInputs />
    </SimpleForm>
  </Edit>
);
