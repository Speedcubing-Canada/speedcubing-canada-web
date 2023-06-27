import { useTranslation } from "react-i18next";
import {
    Container,
} from "@mui/material";
import Button from '@mui/material/Button';
import { signIn } from '../logic/auth';

export const Account = () => {
    const { t } = useTranslation();

  return (
    <Container maxWidth="md">
        <div>Account</div>
        <Button
        variant="outlined"
        component="span"
        
        onClick={signIn}
      >
        Sign in with the WCA
      </Button>
    </Container>
  );
};