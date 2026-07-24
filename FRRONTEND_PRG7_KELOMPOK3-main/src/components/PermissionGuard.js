"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";

export default function PermissionGuard({ children, requiredModule }) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const permissionsStr = localStorage.getItem("permissionData");

    if (!permissionsStr) {
      router.push("/auth/sso");
      return;
    }

    try {
      const permissions = JSON.parse(permissionsStr);
      const hasAccess = permissions.some((p) =>
        p.toLowerCase().startsWith(requiredModule.toLowerCase()),
      );

      if (hasAccess) {
        setIsAllowed(true);
      } else {
        router.push("/auth/sso");
      }
    } catch {
      router.push("/auth/sso");
    }
  }, [requiredModule, router]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requiredModule: PropTypes.string,
};
