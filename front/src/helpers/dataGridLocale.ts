import { enUS, frFR } from "@mui/x-data-grid/locales";
import { getLocaleOrFallback } from "../locale";

// MUI DataGrid ships its own locale strings; map the app locale onto them.
export const dataGridLocaleText = (locale: string) =>
  getLocaleOrFallback(locale) === "fr"
    ? frFR.components.MuiDataGrid.defaultProps.localeText
    : enUS.components.MuiDataGrid.defaultProps.localeText;
