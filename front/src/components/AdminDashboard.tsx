import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material";
import { Confirm, useNotify, useTranslate } from "react-admin";

import { API_BASE_URL } from "./api";
import httpClient from "../httpClient";
import { isSiteAdmin } from "./roles";
import { User } from "../types";

interface Action {
  key: "champions" | "provinces" | "users";
  endpoint: string;
  // Reads the response body for the success message. Undefined = use the plain message.
  count?: (data: unknown) => number;
}

const ACTIONS: Action[] = [
  {
    key: "champions",
    endpoint: "/admin/recompute_championships",
    count: (data) =>
      (data as { data: { championships: number } }).data.championships,
  },
  // Returns the bare string "ok", so there is nothing to count.
  { key: "provinces", endpoint: "/admin/update_provinces" },
  {
    key: "users",
    endpoint: "/admin/reindex_users",
    count: (data) => (data as { data: { users: number } }).data.users,
  },
];

export const AdminDashboard = ({ user }: { user: User | null }) => {
  const t = useTranslate();
  const notify = useNotify();
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  const run = async (action: Action) => {
    setConfirming(null);
    setRunning(action.key);
    const response = await httpClient.post<undefined, unknown>(
      API_BASE_URL + action.endpoint,
    );
    setRunning(null);
    if (response.ok) {
      notify(`admin.maintenance.${action.key}.success`, {
        type: "success",
        messageArgs: { count: action.count?.(response.data) },
      });
    } else {
      notify("admin.maintenance.error", { type: "error" });
    }
  };

  const allowed = isSiteAdmin(user);

  return (
    <Card>
      <CardHeader title={t("admin.title")} />
      <CardContent>{t("admin.body")}</CardContent>
      <Divider />
      <CardHeader title={t("admin.maintenance.title")} />
      <CardContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("admin.maintenance.warning")}
        </Alert>
        {!allowed && (
          <Typography variant="caption" color="warning.main">
            {t("admin.maintenance.forbidden")}
          </Typography>
        )}
        {ACTIONS.map((action) => (
          <Box key={action.key} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="warning"
              disabled={running !== null || !allowed}
              onClick={() => setConfirming(action)}
            >
              {running === action.key
                ? t("admin.maintenance.running")
                : t(`admin.maintenance.${action.key}.label`)}
            </Button>
          </Box>
        ))}
      </CardContent>
      <Confirm
        isOpen={confirming !== null}
        title={confirming ? t(`admin.maintenance.${confirming.key}.label`) : ""}
        content={
          confirming ? t(`admin.maintenance.${confirming.key}.confirm`) : ""
        }
        onConfirm={() => confirming && void run(confirming)}
        onClose={() => setConfirming(null)}
      />
    </Card>
  );
};
