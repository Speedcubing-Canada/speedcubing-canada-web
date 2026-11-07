import { useEffect, useMemo, useState } from "react";
import { Province } from "../types";
import { getProvinces } from "../components/provinces";
import {
  getCachedRankingsPreferredProvinceId,
  setCachedRankingsPreferredProvinceId,
} from "./rankingsProvinceCache";
import { useCurrentUser } from "./useCurrentUser";

const getProvinceById = (
  provinceId: string | null,
  provinces: Province[],
): Province | null => {
  if (!provinceId) {
    return null;
  }
  return provinces.find(({ id }) => id === provinceId) || null;
};

export const useProvincePreference = () => {
  const provinces = useMemo(() => getProvinces(), []);
  const storedProvince = getProvinceById(
    getCachedRankingsPreferredProvinceId(),
    provinces,
  );
  // Only ask who the user is when we don't already have a stored preference.
  const { user, loading } = useCurrentUser({ enabled: !storedProvince });
  const [province, setProvince] = useState<Province | null>(null);
  const [provinceInitialized, setProvinceInitialized] = useState(false);

  useEffect(() => {
    if (provinceInitialized) return;

    if (storedProvince) {
      setProvince(storedProvince);
      setProvinceInitialized(true);
      return;
    }

    if (loading) return;

    let defaultProvince: Province | null = provinces[0] ?? null;
    if (user?.province) {
      const userProvince = getProvinceById(user.province, provinces);
      if (userProvince) {
        defaultProvince = userProvince;
        setCachedRankingsPreferredProvinceId(userProvince.id);
      }
    }

    setProvince(defaultProvince);
    setProvinceInitialized(true);
  }, [provinceInitialized, storedProvince, loading, user, provinces]);

  return { provinces, province, setProvince, provinceInitialized };
};
