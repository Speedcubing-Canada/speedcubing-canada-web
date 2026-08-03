import { Box } from "@mui/material";

// Wraps a row of PersonCard/DelegateCard tiles, wrapping onto multiple lines and
// centering on narrow screens. Shared by Delegates and Organization.
export const CardGrid = ({ children }: { children: React.ReactNode }) => (
  <Box
    display="flex"
    flexWrap="wrap"
    gap={3}
    justifyContent={{ xs: "center", sm: "flex-start" }}
  >
    {children}
  </Box>
);
