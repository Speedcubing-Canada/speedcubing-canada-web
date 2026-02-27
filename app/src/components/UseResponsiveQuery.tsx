import { Theme, useMediaQuery } from "@mui/material";
import { Breakpoint } from "./types";

const UseResponsiveQuery = (breakpoint: Breakpoint) => {
  return useMediaQuery<Theme>((theme) => theme.breakpoints.down(breakpoint));
};

export default UseResponsiveQuery;
