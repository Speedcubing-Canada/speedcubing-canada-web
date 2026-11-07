import { useEffect, useMemo, useState } from "react";
import { Province } from "../types";
import { getProvinces } from "../components/provinces";
import {
  getCachedRankingsPreferredProvinceId,
  setCachedRankingsPreferredProvinceId,
} from "./rankingsProvinceCache";
import { useCurrentUser } from "./useCurrentUser";

const getProvinceById = (
  provinceId: string | null | undefined,
  provinces: Province[],
): Province | null =>
  provinces.find((province) => province.id === provinceId) ?? null;

export const useProvincePreference = () => {
  const provinces = useMemo(() => getProvinces(), []);
  // undefined: untouched on this page; null: the user cleared it.
  const [selected, setSelected] = useState<Province | null | undefined>();
  const storedProvince = getProvinceById(
    getCachedRankingsPreferredProvinceId(),
    provinces,
  );
  // Only ask who the user is when nothing else decides the province.
  const { user, loading } = useCurrentUser({
    enabled: selected === undefined && !storedProvince,
  });
  const userProvince = getProvinceById(user?.province, provinces);

  useEffect(() => {
    if (userProvince) setCachedRankingsPreferredProvinceId(userProvince.id);
  }, [userProvince]);

  const province =
    selected === undefined
      ? (storedProvince ?? userProvince ?? provinces[0] ?? null)
      : selected;

  return {
    provinces,
    province,
    setProvince: setSelected,
    provinceInitialized: !loading,
  };
};
