import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";
import { User } from "../types";

export const CURRENT_USER_KEY = ["current-user"] as const;

// Shared by the account, admin and eligibility pages. Signed out (401) is
// null; any other failure throws so react-query retries and keeps the last
// known user instead of flipping the page to signed out.
export const useCurrentUser = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data, isLoading } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async (): Promise<User | null> => {
      const response = await httpClient.get<User>(`${API_BASE_URL}/user_info`);
      if (response.ok) return response.data ?? null;
      if (response.status === 401) return null;
      throw new Error(`user_info failed with status ${response.status}`);
    },
    enabled,
  });

  return { user: data ?? null, loading: isLoading };
};
