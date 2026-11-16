import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Link } from "@mui/material";
import { Ranking } from "../types";
import { useTranslation } from "react-i18next";
import { getLocaleOrFallback } from "../locale";
import { dataGridLocaleText } from "../helpers/dataGridLocale";
import { formatLink, LINKS } from "../pages/links";
import { useResponsiveQuery } from "./useResponsiveQuery";

export const RankList: React.FC<{ data: Ranking[] }> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const isSmall = useResponsiveQuery("sm");
  const locale = getLocaleOrFallback(i18n.language);

  const columns: GridColDef[] = [
    { field: "rank", headerName: t("ranklist.rank"), width: isSmall ? 50 : 90 },
    {
      field: "name",
      headerName: t("ranklist.name"),
      width: isSmall ? 210 : 300,
      renderCell: (params) => (
        <Link
          href={formatLink(LINKS.WCA.PROFILE, {
            wcaId: params.row.wca_id,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
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
    wca_id: person.wca_id,
  }));

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        localeText={dataGridLocaleText(locale)}
      />
    </Box>
  );
};
