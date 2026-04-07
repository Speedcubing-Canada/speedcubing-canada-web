import React from "react";
import { DataGrid, GridColDef, frFR, enUS } from "@mui/x-data-grid";
import { Link } from "@mui/material";
import { Ranking } from "../types";
import { useTranslation } from "react-i18next";
import { getLocaleOrFallback, SAVED_LOCALE_KEY } from "../locale";
import useResponsiveQuery from "./UseResponsiveQuery";

export const RankList: React.FC<{ data: Ranking[] }> = ({ data }) => {
  const { t } = useTranslation();
  const isSmall = useResponsiveQuery("sm");

  const savedLocale = localStorage.getItem(SAVED_LOCALE_KEY) as string;
  const locale = getLocaleOrFallback(savedLocale);

  const columns: GridColDef[] = [
    { field: "rank", headerName: t("ranklist.rank"), width: isSmall ? 50 : 90 },
    {
      field: "name",
      headerName: t("ranklist.name"),
      width: isSmall ? 210 : 300,
      renderCell: (params) => (
        <Link href={params.row.url} target="_blank" rel="noopener noreferrer">
          {params.value}
        </Link>
      ),
    },
    {
      field: "time",
      headerName: t("ranklist.time"),
      width: isSmall ? 90 : 120,
    },
  ];

  const rows = data.map((person: Ranking, index: number) => ({
    id: index,
    rank: person.rank,
    name: person.name,
    time: person.time,
    url: person.url,
  }));

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        localeText={
          locale === "fr"
            ? frFR.components.MuiDataGrid.defaultProps.localeText
            : enUS.components.MuiDataGrid.defaultProps.localeText
        }
      />
    </div>
  );
};
