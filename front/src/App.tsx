import * as React from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Base as NavBar, ROUTE_NAMES } from "./components/Base";
import {
  DEFAULT_LOCALE,
  getLocaleOrFallback,
  resources,
  SAVED_LOCALE_KEY,
} from "./locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Home = React.lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.Home })),
);
const About = React.lazy(() =>
  import("./pages/About").then((m) => ({ default: m.About })),
);
const Organization = React.lazy(() =>
  import("./pages/Organization").then((m) => ({ default: m.Organization })),
);
const FAQ = React.lazy(() =>
  import("./pages/FAQ").then((m) => ({ default: m.FAQ })),
);
const Series = React.lazy(() =>
  import("./pages/Series").then((m) => ({ default: m.Series })),
);
const Rankings = React.lazy(() =>
  import("./pages/Rankings").then((m) => ({ default: m.Rankings })),
);
const Account = React.lazy(() =>
  import("./pages/Account").then((m) => ({ default: m.Account })),
);
const AdminPage = React.lazy(() =>
  import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);
const Quebec = React.lazy(() =>
  import("./pages/Quebec").then((m) => ({ default: m.Quebec })),
);
const Competition = React.lazy(() =>
  import("./pages/Competition").then((m) => ({ default: m.Competition })),
);

const getInitialLocale = () => {
  const pathLocale = window.location.pathname.split("/")[1];
  if (pathLocale) {
    return getLocaleOrFallback(pathLocale);
  }

  const savedLocale = localStorage.getItem(SAVED_LOCALE_KEY) ?? "";
  return getLocaleOrFallback(savedLocale);
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: Object.keys(resources),
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

const queryClient = new QueryClient();

const App = () => {
  const savedLocale = localStorage.getItem(SAVED_LOCALE_KEY) as string;
  const locale = getLocaleOrFallback(savedLocale);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <React.Suspense fallback={null}>
            <Routes>
              <Route path="/admin/*" element={<AdminPage />} />
              <Route element={<NavBar />}>
                <Route path=":locale/">
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="organization" element={<Organization />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route
                    path="competitions/series/:seriesid"
                    element={<Series />}
                  />
                  <Route
                    path="competitions/:compid"
                    element={<Competition />}
                  />
                  <Route path="rankings" element={<Rankings />} />
                  <Route path="account" element={<Account />} />
                  <Route path="quebec" element={<Quebec />} />
                </Route>
                {ROUTE_NAMES.map((route) => (
                  <Route
                    key={route}
                    path={route}
                    element={<Navigate to={`/${locale}/${route}`} replace />}
                  />
                ))}
                <Route path="*" element={<Navigate to={locale} replace />} />
              </Route>
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
