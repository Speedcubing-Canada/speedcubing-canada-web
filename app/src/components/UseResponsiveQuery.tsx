import { Theme, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Breakpoint } from "./types";

const UseResponsiveQuery = (breakpoint: Breakpoint) => {
  const theme = useTheme();

  return useMediaQuery<Theme>((theme) => theme.breakpoints.down(breakpoint));
};

export default UseResponsiveQuery;
