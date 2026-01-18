import { Card, CardContent, CardHeader } from "@mui/material";
import { useTranslate } from "react-admin";

export const AdminDashboard = () => {
  const t = useTranslate();
  return (
    <Card>
      <CardHeader title={t("admin.title")} />
      <CardContent>{t("admin.body")}</CardContent>
    </Card>
  );
};
