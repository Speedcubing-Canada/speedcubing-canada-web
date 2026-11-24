import { Box, Stack, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const ZAMBONI_WIDTH = 80;
const LAP = "2.8s linear infinite";

const drive = keyframes`
  from { transform: translateX(-${ZAMBONI_WIDTH}px); }
  to { transform: translateX(100%); }
`;

// The clean ice starts growing 15% into a lap, so that its edge follows the rear
// of the Zamboni and not the front. Check the delay again if the rink or the
// Zamboni changes width.
const resurface = keyframes`
  0%, 15% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
`;

const line = (left: string, color: string) => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  left,
  width: 3,
  bgcolor: color,
  opacity: 0.75,
});

// Loading indicator for the championships map: a Zamboni resurfacing a hockey rink.
export function ZamboniLoader() {
  const { t } = useTranslation();
  return (
    <Stack
      spacing={1.5}
      alignItems="center"
      role="progressbar"
      aria-label={t("championships.loadingLabel")}
    >
      <Box
        aria-hidden
        sx={{
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          width: { xs: "min(300px, 80vw)", sm: 420 },
          height: 68,
          borderRadius: "34px",
          border: "3px solid #cdbdb7",
          boxShadow: "0 10px 30px rgba(90,72,68,.18)",
          bgcolor: "#eef3f6",
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 13px, rgba(90,72,68,.08) 13px 15px)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "#fff",
            transformOrigin: "left",
            animation: `${resurface} ${LAP}`,
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              transform: "scaleX(0.4)",
            },
          }}
        />
        <Box sx={line("30%", "#3b6fb6")} />
        <Box sx={line("calc(50% - 1.5px)", "primary.main")} />
        <Box sx={line("70%", "#3b6fb6")} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            animation: `${drive} ${LAP}`,
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              transform: "translateX(40%)",
            },
          }}
        >
          <svg
            viewBox="0 0 40 26"
            width={ZAMBONI_WIDTH}
            height={52}
            style={{ position: "absolute", left: 0, bottom: 4 }}
          >
            <rect x="1" y="18" width="7" height="4" rx="1" fill="#8c7b76" />
            <rect x="4" y="11" width="33" height="10" rx="2.5" fill="#d32f2f" />
            <rect x="19" y="5" width="18" height="13" rx="2.5" fill="#d32f2f" />
            <rect x="23" y="7.5" width="10" height="8.5" rx="1" fill="#fff" />
            <polygon
              fill="#d32f2f"
              transform="translate(25 8.8) scale(0.6)"
              points="5,0 6,2.5 8,1.8 7.5,4.5 10,4.2 8.6,6 9.4,7 6,7.4 6.3,10 5,8 3.7,10 4,7.4 0.6,7 1.4,6 0,4.2 2.5,4.5 2,1.8 4,2.5"
            />
            <rect x="9" y="6.5" width="6" height="6" rx="2" fill="#5a4844" />
            <circle cx="12" cy="5" r="2.4" fill="#f1c9a5" />
            <path d="M9.3 4.4a2.7 2.7 0 0 1 5.4 0z" fill="#d32f2f" />
            <circle
              cx="12"
              cy="1.5"
              r="1"
              fill="#fff"
              stroke="#cdbdb7"
              strokeWidth="0.4"
            />
            <circle cx="11" cy="21.5" r="3.6" fill="#3b302d" />
            <circle cx="30" cy="21.5" r="3.6" fill="#3b302d" />
            <circle cx="11" cy="21.5" r="1.3" fill="#cdbdb7" />
            <circle cx="30" cy="21.5" r="1.3" fill="#cdbdb7" />
          </svg>
        </Box>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {t("championships.loading")}
      </Typography>
    </Stack>
  );
}
