import { Trans, useTranslation } from "react-i18next";
import { useEffect, useReducer, useState } from "react";
import { AlertColor, Box, Container, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { DateField } from "@mui/x-date-pickers";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import { API_BASE_URL, signIn, signOut } from "../components/api";
import {
  AlertAction,
  chipColor,
  ChipData,
  Province,
  AlertState,
  User,
} from "../components/Types";
import httpClient from "../httpClient";
import { getProvincesWithNA, NA_PROVINCE } from "../components/provinces";
import { isAdmin } from "../components/Roles";
import useResponsiveQuery from "../components/useResponsiveQuery";
import { useNavigate } from "react-router-dom";

const initialState: AlertState = {
  alert: false,
  alertType: "info",
  alertContent: "",
};

const reducer = (state: AlertState, action: AlertAction) => {
  switch (action.type) {
    case "SHOW_ALERT":
      return {
        ...state,
        alert: true,
        alertType: action.alertType,
        alertContent: action.alertContent,
      };
    case "HIDE_ALERT":
      return initialState;
    default:
      return state;
  }
};

export const Account = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isSmall = useResponsiveQuery("sm");

  const [province, setProvince] = useState<Province | null>(null);
  const [chipData, setChipData] = useState<readonly ChipData[]>([]);

  const [alertState, alertDispatch] = useReducer(reducer, initialState);

  const provinces: Province[] = getProvincesWithNA();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultProvince: Province =
    provinces.find(({ id }) => id === user?.province) || NA_PROVINCE;
  const defaultDOB = dayjs(user?.dob ?? "2022-01-01");
  const defaultWCAID = user?.wca_person || "";
  const defaultEmail: string = user?.email || "";

  const showAlert = (alertType: AlertColor, alertContent: string) => {
    alertDispatch({
      type: "SHOW_ALERT",
      alertType,
      alertContent,
    });
  };

  const hideAlert = () => {
    alertDispatch({
      type: "HIDE_ALERT",
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get(API_BASE_URL + "/user_info");
        if (!resp.hasOwnProperty("error")) {
          setUser(resp);
        }
      } catch (error) {
        console.log("Not authenticated");
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (user?.roles) {
      const chipData = user.roles.map((role, index) => ({
        key: index,
        label: role,
      }));
      setChipData(chipData);
    }
  }, [user?.roles]);

  const ListItem = styled("li")(({ theme }) => ({
    margin: theme.spacing(0.5),
  }));

  const handleSaveProfile = async () => {
    hideAlert();
    try {
      const resp = await httpClient.post(API_BASE_URL + "/edit", {
        province: province ? province.id : "na",
      });
      if (resp.hasOwnProperty("error")) {
        showAlert("error", t("account.error"));
      } else {
        showAlert("success", t("account.success"));
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    signIn();
  };

  const handleAdmin = () => {
    navigate("/admin");
  };

  const admin = isAdmin(user);

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("account.title")}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : user != null ? (
        <div>
          <Box marginY="2rem">
            <Typography
              component="h2"
              variant="h5"
              fontWeight="bold"
              gutterBottom
              marginY="1rem"
            >
              {t("account.hi")}
              {user.name}!
            </Typography>

            <Stack
              direction={isSmall ? "column" : "row"}
              spacing={2}
              alignItems="center"
              marginY="1rem"
              justifyContent="space-between"
            >
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={provinces}
                sx={{ width: 330 }}
                value={province || defaultProvince}
                defaultValue={defaultProvince}
                onChange={(event, newValue) => {
                  setProvince(newValue);
                  if (newValue?.id === "qc") {
                    console.log("Vive le Québec libre!");
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Province" />
                )}
                getOptionLabel={(option) => t("provinces." + option.id)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              <TextField
                disabled
                id="region"
                label={t("account.region")}
                value={
                  province
                    ? t("regions." + province?.region_id)
                    : t("regions." + defaultProvince.region_id)
                }
                variant="outlined"
              />
            </Stack>
            <Typography variant="subtitle2" gutterBottom>
              <Trans>{t("account.policy")} </Trans>
            </Typography>

            <Stack
              direction={isSmall ? "column" : "row"}
              spacing={2}
              alignItems="center"
              marginY="1rem"
              justifyContent="space-evenly"
              useFlexGap
              flexWrap="wrap"
            >
              <TextField
                disabled
                id="wcaid"
                label="WCAID"
                defaultValue={defaultWCAID}
                variant="outlined"
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                  disabled
                  label={t("account.dob")}
                  defaultValue={defaultDOB}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      sx: { width: 200 },
                    },
                  }}
                />
              </LocalizationProvider>
              <Box>
                <TextField
                  disabled
                  id="email"
                  label={t("account.email")}
                  defaultValue={defaultEmail}
                  variant="outlined"
                  InputProps={{
                    style: {
                      width: `${(defaultEmail.length + 1) * 10}px`,
                      maxWidth: "800px",
                    },
                  }}
                />
              </Box>
            </Stack>

            <Typography variant="subtitle2" gutterBottom>
              {t("account.roles")}
            </Typography>
            <Paper
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                listStyle: "none",
                p: 0.5,
                m: 0,
              }}
              component="ul"
            >
              {chipData.map((data) => {
                const color: chipColor =
                  data.label === "GLOBAL_ADMIN" ||
                  data.label === "DIRECTOR" ||
                  data.label === "WEBMASTER"
                    ? "primary"
                    : "default";

                return (
                  <ListItem key={data.key}>
                    <Chip
                      color={color}
                      label={t("account.role." + data.label) || data.label}
                    />
                  </ListItem>
                );
              })}
            </Paper>
          </Box>

          <Stack
            direction={isSmall ? "column" : "row"}
            spacing={2}
            alignItems="center"
            marginY="1rem"
            justifyContent="space-between"
          >
            <Button
              variant="outlined"
              component="span"
              onClick={handleSaveProfile}
            >
              {t("account.save")}
            </Button>
            {admin && (
              <Button variant="outlined" component="span" onClick={handleAdmin}>
                {t("account.admin")}
              </Button>
            )}
            <Button variant="outlined" component="span" onClick={signOut}>
              {t("account.signout")}
            </Button>
          </Stack>
          {alertState.alert && (
            <Box marginY="1rem">
              <Alert
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={hideAlert}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                variant="outlined"
                severity={alertState.alertType}
              >
                {alertState.alertContent}
              </Alert>
            </Box>
          )}
        </div>
      ) : (
        <div>
          <Box marginY="2rem">
            <Typography variant="subtitle1" gutterBottom>
              <Trans>{t("account.welcome")} </Trans>
            </Typography>
            <Button variant="outlined" component="span" onClick={handleSignIn}>
              {t("account.signin")}
            </Button>
          </Box>
        </div>
      )}
    </Container>
  );
};
