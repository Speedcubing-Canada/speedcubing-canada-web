import { useTranslation } from "react-i18next";
import {
    Container,
} from "@mui/material";
import Button from '@mui/material/Button';
import {GetUser, signIn, signOut} from '../components/Api';

export const Account = () => {
    const { t } = useTranslation();
    const user = GetUser();
    

  return (
    <Container maxWidth="md">
        {user != null ? (
            <div>
                <div>Logged in as {user.name}</div>
                <Button
                variant="outlined"
                component="span"

                onClick={signOut}>
                Sign out
                </Button>
            </div>
        ) : (
            <div>
                <div>Welcome to the account page</div>
                <Button
                variant="outlined"
                component="span"

                onClick={signIn}>
                Sign in with the WCA
                </Button>
            </div>
        )}

    </Container>
  );
};