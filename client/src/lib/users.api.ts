import type { SuggestedUser } from "../types/types";
import { useApi } from "./useApi";

export type SuggestedUsersRsponse = {
  users: SuggestedUser[];
};

export function useUsers() {
  const authFetch = useApi();

  return function getSuggedtedUsers() {
    return authFetch<SuggestedUsersRsponse>("/users/suggested");
  };
}

// export function followUser(userId: string) {
//   return apiFetch(`/users/follow/${userId}`, {
//     method: "POST",
//   });
// }
