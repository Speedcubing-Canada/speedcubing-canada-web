import CanadaMap from "@svg-maps/canada";
import { projectToMap } from "./CanadaRegionMap";

const [, , WIDTH, HEIGHT] = (CanadaMap as { viewBox: string }).viewBox
  .split(" ")
  .map(Number);

describe("projectToMap", () => {
  it("puts Canada's geographic extremes on the corners of the map", () => {
    // No single place sits on this corner. The latitude is that of Cape Columbia,
    // Canada's northernmost point, and the longitude is that of the Yukon/Alaska
    // border, its westernmost.
    const northWest = projectToMap(83.11, -141.0);
    expect(Math.abs(northWest.x)).toBeLessThan(3);
    expect(Math.abs(northWest.y)).toBeLessThan(3);

    // Likewise for the opposite corner: the latitude of Middle Island, the
    // southernmost point, and the longitude of Cape Spear, the easternmost.
    const southEast = projectToMap(41.68, -52.62);
    expect(Math.abs(southEast.x - WIDTH)).toBeLessThan(3);
    expect(Math.abs(southEast.y - HEIGHT)).toBeLessThan(3);
  });

  it("separates two cities of the same region", () => {
    const edmonton = projectToMap(53.55, -113.49);
    const calgary = projectToMap(51.05, -114.07);
    expect(calgary.y - edmonton.y).toBeGreaterThan(30);
  });
});
