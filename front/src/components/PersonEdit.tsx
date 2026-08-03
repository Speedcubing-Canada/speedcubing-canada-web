import { Edit, SimpleForm } from "react-admin";
import { PersonInputs } from "./PersonForm";

export const PersonEdit = () => (
  <Edit>
    <SimpleForm>
      <PersonInputs />
    </SimpleForm>
  </Edit>
);
