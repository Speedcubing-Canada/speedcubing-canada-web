import { Create, SimpleForm } from "react-admin";
import { TeamInputs } from "./TeamForm";

export const TeamCreate = () => (
  <Create>
    <SimpleForm>
      <TeamInputs create />
    </SimpleForm>
  </Create>
);
