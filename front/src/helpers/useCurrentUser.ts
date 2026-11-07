import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";
import { User } from "../types";

// Cached current-user lookup shared by the account, admin and eligibility pages.
// A failed request (e.g. 401 when signed out) resolves to null instead of throwing.
export const useCurrentUser = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data, isPending } = useQuery({
    queryKey: ["current-user"],
    queryFn: async (): Promise<User | null> => {
      const response = await httpClient.get<User>(`${API_BASE_URL}/user_info`);
      return response.ok ? (response.data ?? null) : null;
    },
    enabled,
  });

  return { user: data ?? null, loading: isPending };
};
