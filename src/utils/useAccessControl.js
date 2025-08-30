import { useAuth } from "../context/AuthContext";

const ROLES = {
  ADMIN: "admin",
  VIEWER: "viewer",
};

const IS_VIEW_ONLY = (role) => role === ROLES.VIEWER;

export const useAccessControl = () => {
  const { user } = useAuth();
  return {
    isReadOnly: IS_VIEW_ONLY(user?.role),
    role: user?.role,
  };
};
