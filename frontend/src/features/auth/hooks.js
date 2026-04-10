import { useSelector } from "react-redux";

export function useAuthState() {
  return useSelector((state) => state.auth);
}
