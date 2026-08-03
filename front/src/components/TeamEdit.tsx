import { Edit, SimpleForm } from "react-admin";
import { TeamInputs } from "./TeamForm";

export const TeamEdit = () => (
  <Edit>
    <SimpleForm>
      <TeamInputs />
    </SimpleForm>
  </Edit>
);
