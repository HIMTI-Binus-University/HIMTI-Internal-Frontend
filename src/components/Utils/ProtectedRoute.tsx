import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/utils/auth-client";
import { HimtiPermission } from "@/types/route";
import { useGetMe } from "@/api/auth/queries";
import { needsRegistrationCompletion } from "@/utils/registration-access";
import { AppLoading } from "@/components/app-motion";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: HimtiPermission;
  alternatePermissions?: readonly HimtiPermission[];
  allowedRoles?: string[];
}

const noAllowedRoles: string[] = [];

export const ProtectedRoute = ({
  children,
  requiredPermission,
  alternatePermissions,
  allowedRoles = noAllowedRoles,
}: ProtectedRouteProps) => {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const navigate = useNavigate();
  const { data: meData, isLoading: isMeLoading } = useGetMe(!!session);

  const canAccess =
    !requiredPermission ||
    meData?.permissions.includes(requiredPermission) ||
    alternatePermissions?.some((permission) => meData?.permissions.includes(permission)) ||
    allowedRoles.some((role) => meData?.roles.includes(role));

  const isPending = isSessionPending || (!!session && isMeLoading);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        navigate("/login", { replace: true });
      } else if (meData && needsRegistrationCompletion(meData)) {
        navigate("/complete-registration", { replace: true });
      } else if (
        meData && !canAccess
      ) {
        navigate("/?warning=no-permissions", { replace: true });
      }
    }
  }, [session, isPending, navigate, canAccess, meData]);

  if (isPending) return <AppLoading label="Loading HIMTI Internal Tools" />;

  // Render children jika lolos pengecekan
  const isAuthorized =
    session &&
    meData &&
    !needsRegistrationCompletion(meData) &&
    canAccess;

  return isAuthorized ? <>{children}</> : null;
};
