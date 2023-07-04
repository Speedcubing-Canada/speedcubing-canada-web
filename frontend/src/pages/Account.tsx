import { useTranslation } from "react-i18next";
import {
    Container,
} from "@mui/material";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {API_BASE_URL, GetUser, signIn, signOut} from '../components/Api';
import {useState} from "react";
import {Province} from "../components/Types";
import httpClient from "../httpClient";

export const Account = () => {
    const { t } = useTranslation();

    const [province, setProvince] = useState<Province | null>(null);

    const user = GetUser();//TODO: display something else while loading
    if (user != null && user.province != null) {
        //TODO:  set province in the combo box
    }

    const provinces : Province[] = [
        { label: 'Alberta', id:'ab' },
        { label: 'British Columbia', id:'bc' },
        { label: 'Manitoba', id:'mb' },
        { label: 'New Brunswick', id:'nb' },
        { label: 'Newfoundland and Labrador', id:'nl' },
        { label: 'Northwest Territories', id:'nt' },
        { label: 'Nova Scotia', id:'ns' },
        { label: 'Nunavut', id:'nu' },
        { label: 'Ontario', id:'on' },
        { label: 'Prince Edward Island', id:'pe' },
        { label: 'Quebec', id:'qc' },
        { label: 'Saskatchewan', id:'sk' },
        { label: 'Yukon', id:'yt' },
        { label: 'N/A', id:'na' },
    ];


    const handleSaveProfile = async () => {
      try {
        const resp = await httpClient.post(API_BASE_URL + "/edit", {
          province: province ? province.id : 'na',
        });
        const saved = resp.data;
        // Handle the saved data as needed
      } catch (error) {
        console.log("Not authenticated");
      }
    };

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

                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={provinces}
                  sx={{ width: 300 }}
                  value={province}
                  onChange={(event, newValue) => {
                      setProvince(newValue);
                      if(newValue == null) {}
                      else if(newValue.id === "qc") {
                          console.log("Vive le Québec libre!");
                      }
                }}
                  renderInput={(params) => <TextField {...params} label="Province" />}
                />
                
                <div>Province determine your eligibility for Regional Championships. You may only represent a province where you live at least 50% of the year. We reserve the right to ask for proof of residency. If you are not a Canadian resident, or you would prefer not to list your home province, please select "N/A". </div>
                <Button
                variant="outlined"
                component="span"

                onClick={handleSaveProfile}>
                Save
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