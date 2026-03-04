import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/utils/auth-client";
import { HimtiPermission } from "@/types/route";
import { useGetMe } from "@/api/auth/queries";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: HimtiPermission;
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
}: ProtectedRouteProps) => {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const navigate = useNavigate();
  const { data: meData, isLoading: isMeLoading } = useGetMe(!!session);

  const isPending = isSessionPending || (!!session && isMeLoading);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        // Belum login sama sekali -> lempar ke login
        navigate("/login");
      } else if (
        requiredPermission &&
        meData &&
        !meData.permissions.includes(requiredPermission)
      ) {
        // Sudah login, tapi TIDAK punya permission yang diminta -> lempar ke home
        navigate("/");
      }
    }
  }, [session, isPending, navigate, requiredPermission, meData]);

  if (isPending) return <div>Loading...</div>;

  // Render children jika lolos pengecekan
  const isAuthorized =
    session &&
    meData &&
    (!requiredPermission || meData.permissions.includes(requiredPermission));

  return isAuthorized ? <>{children}</> : null;
};
