import { useAuth as useAuthHook } from "../hooks/useAuth";

export function useAuth() {
  return useAuthHook();
}
