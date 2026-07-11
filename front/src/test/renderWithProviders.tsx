// Renders a page component inside the same providers App.tsx wraps it in
// (MUI theme, i18next, router). Pages read useParams().locale, so the UI is
// mounted under a ":locale/*" route with a default entry of "/en".
import { ReactElement } from "react";
import { render } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import i18n from "./i18n";

const theme = createTheme({ palette: { primary: red } });

export function renderWithProviders(
  ui: ReactElement,
  { route = "/en" }: { route?: string } = {},
) {
  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path=":locale/*" element={ui} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </ThemeProvider>,
  );
}

export { i18n };
