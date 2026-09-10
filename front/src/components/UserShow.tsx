import {
  ArrayField,
  ChipField,
  DateField,
  EmailField,
  Labeled,
  Show,
  SimpleShowLayout,
  TextField,
  useListContext,
  useRecordContext,
  useTranslate,
} from "react-admin";
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { LINKS } from "../pages/links";
import { LocationUpdate } from "../types";

const WCA_PROFILE_URL = LINKS.WCA.PROFILE;

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <ProvinceField source="province" />
      <ArrayField source="roles">
        <UserRoleChip />
      </ArrayField>
      <DateField source="dob" />
      <WcaProfileUrlField source="wca_id" />
      <EmailField source="email" />
      <ResidencyHistoryField source="updates" />
    </SimpleShowLayout>
  </Show>
);

// Province change history (newest first), to debug residency-based championship
// eligibility (residency is resolved as of a championship's deadline).
const ResidencyHistoryField = ({ source }: { source: string }) => {
  const t = useTranslate();
  const record = useRecordContext();
  if (!record) return null;
  const updates = (record[source] as LocationUpdate[] | undefined) ?? [];
  return (
    <Labeled label={t("translation.residency.history")}>
      {updates.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          {t("translation.residency.none")}
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("translation.residency.date")}</TableCell>
              <TableCell>{t("translation.residency.province")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {updates.map((update) => (
              <TableRow key={update.update_time}>
                <TableCell>
                  {new Date(update.update_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  {t(`translation.provinces.${update.province}`)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Labeled>
  );
};

export const UserRoleChip = () => {
  const t = useTranslate();
  const { data } = useListContext();
  return (
    <div>
      {data?.map((roleId) => {
        const roleName = t(`translation.account.role.${roleId}`);
        return (
          <ChipField key={roleId} record={{ name: roleName }} source="name" />
        );
      })}
    </div>
  );
};

const WcaProfileUrlField = ({ source }: { source: string }) => {
  const record = useRecordContext();
  return record ? (
    <Link
      href={WCA_PROFILE_URL + record[source]}
      sx={{ textDecoration: "none" }}
    >
      {record[source]}
    </Link>
  ) : null;
};

export const ProvinceField = ({ source }: { source: string }) => {
  const t = useTranslate();
  const record = useRecordContext();
  if (!record) {
    return null;
  }
  const translatedLabel = t(`translation.provinces.${record[source]}`);

  return <ChipField record={{ label: translatedLabel }} source="label" />;
};
