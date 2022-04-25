import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Base } from "./components/Base";
import { DEFAULT_LOCALE, resources } from "./locale";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Organization } from "./pages/Organization";
import { FAQ } from "./pages/FAQ";

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
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

const App = () => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <Routes>
        <Route element={<Base />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="organization" element={<Organization />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
