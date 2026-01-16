"use client";

import { useEffect } from "react";
import { logout } from "@/app/actions/auth";

interface SessionManagerProps {
  hasUser: boolean;
  hasSessionCookie: boolean;
}

export default function SessionManager({
  hasUser,
  hasSessionCookie,
}: SessionManagerProps) {
  useEffect(() => {
    if (!hasUser && hasSessionCookie) {
      // Session exists but user not found -> invalid session.
      // Clear it so user is truly logged out.
      logout();
    }
  }, [hasUser, hasSessionCookie]);

  return null;
}
