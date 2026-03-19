import { useEffect, useState } from "react";
import { Province, User } from "../components/types";
import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";
import {
  getCachedRankingsPreferredProvinceId,
  removeCachedRankingsPreferredProvinceId,
  setCachedRankingsPreferredProvinceId,
} from "./rankingsProvinceCache";

const getProvinceById = (
  provinceId: string | null,
  provinces: Province[],
): Province | null => {
  if (!provinceId) {
    return null;
  }
  return provinces.find(({ id }) => id === provinceId) || null;
};

export const useProvincePreference = (provinces: Province[]) => {
  const [province, setProvince] = useState<Province | null>(null);
  const [provinceInitialized, setProvinceInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeProvince = async () => {
      let defaultProvince: Province | null = provinces[0] || null;

      const storedProvinceId = getCachedRankingsPreferredProvinceId();
      const storedProvince = getProvinceById(storedProvinceId, provinces);

      if (storedProvinceId && !storedProvince) {
        removeCachedRankingsPreferredProvinceId();
      }

      if (storedProvince) {
        if (!mounted) {
          return;
        }
        setProvince(storedProvince);
        setProvinceInitialized(true);
        return;
      }

      const response = await httpClient.get<User>(API_BASE_URL + "/user_info");
      if (response.ok && response.data?.province) {
        const userProvince = getProvinceById(response.data.province, provinces);
        if (userProvince) {
          defaultProvince = userProvince;
          setCachedRankingsPreferredProvinceId(userProvince.id);
        }
      }

      if (!mounted) {
        return;
      }

      setProvince(defaultProvince);
      setProvinceInitialized(true);
    };

    initializeProvince();

    return () => {
      mounted = false;
    };
  }, [provinces]);

  return { province, setProvince, provinceInitialized };
};
