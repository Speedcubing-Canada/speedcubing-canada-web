import { Create, SimpleForm } from "react-admin";
import { PersonInputs } from "./PersonForm";

export const PersonCreate = () => (
  <Create>
    <SimpleForm>
      <PersonInputs create />
    </SimpleForm>
  </Create>
);
