import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/material/styles";
import type { Breakpoint } from "../types";

// True when the viewport is at or below the given breakpoint. Shared by every
// page/list so the mobile cut-off stays consistent.
export const useResponsiveQuery = (breakpoint: Breakpoint) =>
  useMediaQuery<Theme>((theme) => theme.breakpoints.down(breakpoint));
