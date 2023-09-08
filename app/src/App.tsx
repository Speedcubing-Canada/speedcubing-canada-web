import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Base } from "./components/Base";
import { getLocaleOrFallback, resources, SAVED_LOCALE } from "./locale";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Organization } from "./pages/Organization";
import { FAQ } from "./pages/FAQ";
import { Series } from "./pages/Series";
import { Competitions } from "./pages/Competitions";
import { Competition } from "./pages/Competition";

i18n.use(initReactI18next).init({
  resources,
  interpolation: {
    escapeValue: false,
  },
});

const theme = createTheme({
  typography: {
    fontFamily: "'Montserrat', 'Arial', 'Helvetica', sans-serif",
    body1: {
      whiteSpace: "pre-wrap",
    },
  },
  palette: {
    primary: red,
  },
});

const App = () => {
  const savedLocale = localStorage.getItem(SAVED_LOCALE) as string;
  const locale = getLocaleOrFallback(savedLocale);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Base />}>
            <Route path=":locale/">
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="organization" element={<Organization />} />
              <Route path="faq" element={<FAQ />} />
              <Route
                path="competitions/series/:seriesid"
                element={<Series />}
              />
              <Route path="competitions/:compid" element={<Competition />} />
              <Route path="competitions" element={<Competitions />} />
            </Route>
            {["about", "organization", "faq"].map((route) => (
              <Route
                key={route}
                path={route}
                element={<Navigate to={`/${locale}/${route}`} replace />}
              />
            ))}
            <Route path="*" element={<Navigate to={locale} replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
