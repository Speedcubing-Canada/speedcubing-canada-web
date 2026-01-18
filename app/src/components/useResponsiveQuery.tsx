import { Theme, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Breakpoint } from "./Types";

const useResponsiveQuery = (breakpoint: Breakpoint | string) => {
  const theme = useTheme();
  const query =
    typeof breakpoint === "string" ? (breakpoint as Breakpoint) : breakpoint;

  return useMediaQuery<Theme>((theme) => theme.breakpoints.down(query));
};

export default useResponsiveQuery;
