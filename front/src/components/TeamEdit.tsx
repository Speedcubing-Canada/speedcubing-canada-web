import { useContext } from "react";
import { Edit, SaveButton, SimpleForm, Toolbar } from "react-admin";
import { TeamInputs } from "./TeamForm";
import { AdminUserContext } from "./AdminUserContext";
import { isSiteAdmin } from "./roles";

const SaveOnlyToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export const TeamEdit = () => {
  const full = isSiteAdmin(useContext(AdminUserContext));
  return (
    <Edit>
      <SimpleForm toolbar={full ? undefined : <SaveOnlyToolbar />}>
        <TeamInputs />
      </SimpleForm>
    </Edit>
  );
};
