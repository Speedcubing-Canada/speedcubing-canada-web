import { Create, SimpleForm } from "react-admin";
import { ChampionshipInputs } from "./ChampionshipForm";

export const ChampionshipCreate = () => (
  <Create>
    <SimpleForm>
      <ChampionshipInputs />
    </SimpleForm>
  </Create>
);
