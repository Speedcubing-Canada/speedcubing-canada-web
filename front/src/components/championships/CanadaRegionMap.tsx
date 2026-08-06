import CanadaMap from "@svg-maps/canada";
import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { PROVINCE_REGION, REGION_ORDER, RegionId } from "./data";

interface SvgLocation {
  name: string;
  id: string;
  path: string;
}

const LOCATIONS: SvgLocation[] = (CanadaMap as { locations: SvgLocation[] })
  .locations;
const VIEW = ((CanadaMap as { viewBox: string }).viewBox || "0 0 793 1032")
  .split(" ")
  .map(Number);
const [, , VBW, VBH] = VIEW;
const FULL = { x: 0, y: 0, w: VBW, h: VBH };

// Regions whose population matters for the default framing (everything but the
// sparsely-populated Territories). The home view centres on these; the
// Territories only peek in at the top.
const SOUTH: RegionId[] = ["bc", "pr", "on", "qc", "at"];

// Shared region palette. Exported so the page legend (Championships.tsx) draws the
// exact same announced/quiet colours as the map and can't drift out of sync.
export const COLORS = {
  announced: "#e7a19c",
  announcedBorder: "#c0392b",
  announcedHover: "#dd8983",
  quiet: "#e6ddd9",
  quietBorder: "#cdbdb7",
  quietHover: "#dccfca",
  selected: "#d32f2f",
  stroke: "#ffffff",
  strokeSelected: "#9e231d",
  label: "#5a4844",
};

interface Box4 {
  x: number;
  y: number;
  w: number;
  h: number;
}

const regionOf = (provinceId: string): RegionId | undefined =>
  PROVINCE_REGION[provinceId];

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Grow a box to a target aspect ratio. `topBias` (0..1) controls how much of the
// added vertical slack goes above the box (towards the north / territories).
function fitAspect(box: Box4, aspect: number, topBias = 0.5): Box4 {
  let { x, y, w, h } = box;
  if (w / h < aspect) {
    const nw = h * aspect;
    x -= (nw - w) / 2;
    w = nw;
  } else {
    const nh = w / aspect;
    y -= (nh - h) * topBias;
    h = nh;
  }
  return { x, y, w, h };
}

function unionBoxes(
  boxes: Partial<Record<RegionId, Box4>>,
  ids: RegionId[],
): Box4 | null {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  ids.forEach((id) => {
    const b = boxes[id];
    if (!b) return;
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w);
    y1 = Math.max(y1, b.y + b.h);
  });
  if (x1 <= x0) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export interface CanadaRegionMapProps {
  selectedRegion: RegionId | null;
  onSelect: (region: RegionId) => void;
  // Which regions have an announced upcoming championship (drives the map colours
  // + pulsing pins). Populated from the backend overview.
  announcedRegions: Partial<Record<RegionId, boolean>>;
}

export const CanadaRegionMap: React.FC<CanadaRegionMapProps> = ({
  selectedRegion,
  onSelect,
  announcedRegions,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const [viewBox, setViewBox] = useState<Box4>(FULL);
  const [boxes, setBoxes] = useState<Partial<Record<RegionId, Box4>>>({});
  const [homeView, setHomeView] = useState<Box4>(FULL);

  const vbRef = useRef(viewBox);
  vbRef.current = viewBox;
  const aspectRef = useRef(VBW / VBH);
  const rafRef = useRef<number | undefined>();
  const finalizeRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  // Tracks the previous selection so we can animate the zoom-out on close but
  // snap (no animation) on the initial load and on resize.
  const prevSelRef = useRef<RegionId | null>(null);

  // Measure each region's combined bounding box (in SVG user units).
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const next: Partial<Record<RegionId, Box4>> = {};
    REGION_ORDER.forEach((rid) => {
      const paths = svg.querySelectorAll<SVGPathElement>(
        `path[data-region="${rid}"]`,
      );
      let x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity;
      paths.forEach((p) => {
        const b = p.getBBox();
        x0 = Math.min(x0, b.x);
        y0 = Math.min(y0, b.y);
        x1 = Math.max(x1, b.x + b.width);
        y1 = Math.max(y1, b.y + b.height);
      });
      if (x1 > x0) next[rid] = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    });
    setBoxes(next);
  }, []);

  // Derive the home view from the southern regions and the container's real aspect.
  // Only updates homeView/aspect - never touches the live viewBox (the effect below
  // owns viewBox transitions so closing the panel animates instead of snapping).
  const recomputeHome = useCallback((bx: Partial<Record<RegionId, Box4>>) => {
    const svg = svgRef.current;
    if (svg) {
      const r = svg.getBoundingClientRect();
      if (r.width && r.height) aspectRef.current = r.width / r.height;
    }
    const south = unionBoxes(bx, SOUTH);
    if (!south) return;
    // Small horizontal margin + extra space above so the Territories peek in.
    const padded: Box4 = {
      x: south.x - south.w * 0.03,
      y: south.y - south.h * 0.12,
      w: south.w * 1.06,
      h: south.h * 1.16,
    };
    setHomeView(fitAspect(padded, aspectRef.current, 0.78));
  }, []);

  useLayoutEffect(() => {
    if (Object.keys(boxes).length > 0) recomputeHome(boxes);
  }, [boxes, recomputeHome]);

  useEffect(() => {
    const onResize = () => recomputeHome(boxes);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [boxes, recomputeHome]);

  const animateTo = useCallback((target: Box4) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (finalizeRef.current) clearTimeout(finalizeRef.current);
    const start = { ...vbRef.current };
    const t0 = performance.now();
    const dur = 760;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = easeInOut(p);
      setViewBox({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        w: start.w + (target.w - start.w) * e,
        h: start.h + (target.h - start.h) * e,
      });
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    // Safety net: if rAF is throttled (e.g. background tab), still land on target.
    finalizeRef.current = setTimeout(() => setViewBox(target), dur + 80);
  }, []);

  // Zoom to the selected region, or animate back out to the home view on close.
  useEffect(() => {
    if (!selectedRegion) {
      // Closing the panel (prev was a region) -> animate the inverse zoom-out.
      // Initial mount / resize while already home -> snap straight to the home view.
      if (prevSelRef.current) animateTo(homeView);
      else setViewBox(homeView);
      prevSelRef.current = null;
      return;
    }
    prevSelRef.current = selectedRegion;
    const b = boxes[selectedRegion];
    const svg = svgRef.current;
    if (!b || !svg) return;
    const rect = svg.getBoundingClientRect();
    const svgW = rect.width || 1;
    const svgH = rect.height || 1;

    // The detail panel (right drawer on desktop, bottom sheet on mobile) covers
    // part of the map. Compute the still-visible sub-rect of the svg so we can
    // place the selected region in its centre and size it to fill it.
    const DRAWER_W = Math.min(460, window.innerWidth * 0.94);
    const SHEET_H = window.innerHeight * 0.78;
    let visLeft = rect.left,
      visRight = rect.right,
      visTop = rect.top,
      visBottom = rect.bottom;
    if (isSmall) {
      visBottom = Math.min(visBottom, window.innerHeight - SHEET_H);
    } else {
      visRight = Math.min(visRight, window.innerWidth - DRAWER_W);
    }
    const vrw = Math.max(60, visRight - visLeft);
    const vrh = Math.max(60, visBottom - visTop);

    const pad = 0.3;
    const pw = b.w * (1 + pad * 2);
    const ph = b.h * (1 + pad * 2);
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;

    // Width of viewBox (covering the whole svg) needed so the padded region fits
    // inside the visible sub-rect on both axes; keep the svg's aspect ratio.
    const w = svgW * Math.max(pw / vrw, ph / vrh);
    const h = w * (svgH / svgW);
    // Fraction (within the svg) of the visible sub-rect's centre.
    const fx = (visLeft + vrw / 2 - rect.left) / svgW;
    const fy = (visTop + vrh / 2 - rect.top) / svgH;
    animateTo({ x: cx - fx * w, y: cy - fy * h, w, h });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, boxes, isSmall, homeView]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (finalizeRef.current) clearTimeout(finalizeRef.current);
    },
    [],
  );

  const fillFor = (rid: RegionId | undefined): string => {
    if (!rid) return COLORS.quiet;
    if (rid === selectedRegion) return COLORS.selected;
    const announced = Boolean(announcedRegions[rid]);
    if (rid === hovered)
      return announced ? COLORS.announcedHover : COLORS.quietHover;
    return announced ? COLORS.announced : COLORS.quiet;
  };

  const showLabels = !selectedRegion;

  // Keep every label inside the home view (so the Territories label, whose true
  // centroid is far north, stays visible near the top edge).
  const labelPos = (regionId: RegionId, b: Box4) => {
    const cx = b.x + b.w / 2;
    let cy = b.y + b.h / 2;
    const top = homeView.y + homeView.h * 0.07;
    const bottom = homeView.y + homeView.h * 0.94;
    if (cy < top) cy = top;
    if (cy > bottom) cy = bottom;
    // Pull the wide Territories label towards the visible centre horizontally too.
    const cxClamped =
      regionId === "te"
        ? Math.min(
            Math.max(cx, homeView.x + homeView.w * 0.2),
            homeView.x + homeView.w * 0.8,
          )
        : cx;
    return { cx: cxClamped, cy };
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          overflow: "hidden",
        }}
      >
        <style>{`
          @keyframes scc-pin { 0% { transform: scale(1); opacity: .5; } 100% { transform: scale(3.4); opacity: 0; } }
        `}</style>

        {LOCATIONS.map((loc) => {
          const regionId = regionOf(loc.id);
          const isSel = regionId && regionId === selectedRegion;
          const dim = selectedRegion && !isSel ? 0.32 : 1;
          return (
            <path
              key={loc.id}
              d={loc.path}
              data-pid={loc.id}
              data-region={regionId}
              fill={fillFor(regionId)}
              stroke={isSel ? COLORS.strokeSelected : COLORS.stroke}
              strokeWidth={isSel ? 1.4 : 0.8}
              strokeLinejoin="round"
              style={{
                cursor: regionId ? "pointer" : "default",
                opacity: dim,
                transition: "fill .25s ease, opacity .45s ease",
              }}
              onClick={() => regionId && onSelect(regionId)}
              onMouseEnter={() => regionId && setHovered(regionId)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {showLabels &&
          (Object.keys(boxes) as RegionId[]).map((regionId) => {
            const { cx, cy } = labelPos(regionId, boxes[regionId]!);
            const announced = Boolean(announcedRegions[regionId]);
            return (
              <g
                key={`lbl-${regionId}`}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(regionId)}
                onMouseEnter={() => setHovered(regionId)}
                onMouseLeave={() => setHovered(null)}
              >
                {announced && (
                  <>
                    <circle
                      cx={cx}
                      cy={cy - 22}
                      r={5}
                      fill="none"
                      stroke={COLORS.selected}
                      strokeWidth={2}
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        animation: "scc-pin 2.4s ease-out infinite",
                      }}
                    />
                    <circle
                      cx={cx}
                      cy={cy - 22}
                      r={5}
                      fill={COLORS.selected}
                      stroke="#fff"
                      strokeWidth={1.4}
                    />
                  </>
                )}
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    fill: COLORS.label,
                    paintOrder: "stroke",
                    stroke: "#fbf7f5",
                    strokeWidth: 4,
                    strokeLinejoin: "round",
                  }}
                >
                  {t(`championships.regions.${regionId}`)}
                </text>
              </g>
            );
          })}
      </svg>
    </Box>
  );
};
