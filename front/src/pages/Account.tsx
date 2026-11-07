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
import { useQueryClient } from "@tanstack/react-query";

import { API_BASE_URL, signIn, signOut } from "../components/api";
import { AlertAction, Province, AlertState, User } from "../types";
import httpClient from "../httpClient";
import { getProvincesWithNA, getNAProvince } from "../components/provinces";
import { isAdmin, hasDelegateOrAdminRole } from "../components/roles";
import { useResponsiveQuery } from "../components/useResponsiveQuery";
import {
  isValidProvinceId,
  removeCachedRankingsPreferredProvinceId,
  setCachedRankingsPreferredProvinceId,
} from "../helpers/rankingsProvinceCache";
import { useCurrentUser } from "../helpers/useCurrentUser";
import { getLocaleOrFallback, SAVED_LOCALE_KEY } from "../locale";
import { useNavigate } from "react-router";

const PRIMARY_ROLES = new Set(["GLOBAL_ADMIN", "DIRECTOR", "WEBMASTER"]);

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

  const [alertState, alertDispatch] = useReducer(reducer, initialState);

  const provinces: Province[] = getProvincesWithNA();

  const { user, loading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [signingIn, setSigningIn] = useState(false);

  const defaultProvince: Province =
    provinces.find(({ id }) => id === user?.province) || getNAProvince();
  const defaultWCAID = user?.wca_id || "";
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
    if (user && isValidProvinceId(user.province)) {
      setCachedRankingsPreferredProvinceId(user.province);
    }
  }, [user]);

  const ListItem = styled("li")(({ theme }) => ({
    margin: theme.spacing(0.5),
  }));

  const handleSaveProfile = async () => {
    hideAlert();
    const selectedProvince = province || defaultProvince;

    const response = await httpClient.post<
      { province: string },
      unknown,
      { code?: string; next_allowed?: string }
    >(`${API_BASE_URL}/edit`, {
      province: selectedProvince.id,
    });

    if (response.ok) {
      if (isValidProvinceId(selectedProvince.id)) {
        setCachedRankingsPreferredProvinceId(selectedProvince.id);
      } else {
        removeCachedRankingsPreferredProvinceId();
      }

      queryClient.setQueryData<User | null>(["current-user"], (previousUser) =>
        previousUser
          ? {
              ...previousUser,
              province: selectedProvince.id,
            }
          : previousUser,
      );
      showAlert("success", t("account.success"));
    } else if (response.error?.code === "province_change_rate_limited") {
      const nextAllowed = response.error.next_allowed;
      showAlert(
        "error",
        t("account.provinceChangeLimited", {
          date: nextAllowed ? dayjs(nextAllowed).format("DD-MM-YYYY") : "",
        }),
      );
    } else {
      showAlert("error", t("account.error"));
    }
  };

  const handleSignIn = () => {
    setSigningIn(true);
    signIn();
  };

  const handleAdmin = () => {
    void navigate("/admin");
  };

  const handleEligibility = () => {
    const locale = getLocaleOrFallback(
      localStorage.getItem(SAVED_LOCALE_KEY) ?? "",
    );
    void navigate(`/${locale}/championship-eligibility`);
  };

  const admin = isAdmin(user);
  const delegate = hasDelegateOrAdminRole(user);

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("account.title")}
        </Typography>
      </Box>
      {loading || signingIn ? (
        <CircularProgress />
      ) : user == null ? (
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
      ) : (
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
                onChange={(_event, newValue) => {
                  setProvince(newValue);
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
                  defaultValue={user.dob ? dayjs(user.dob) : null}
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
              {user.roles?.map((role) => (
                <ListItem key={role}>
                  <Chip
                    color={PRIMARY_ROLES.has(role) ? "primary" : "default"}
                    label={t(`account.role.${role}`) || role}
                  />
                </ListItem>
              ))}
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
            {delegate && (
              <Button
                variant="outlined"
                component="span"
                onClick={handleEligibility}
              >
                {t("account.eligibility")}
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
      )}
    </Container>
  );
};
