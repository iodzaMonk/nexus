"use client";

import { useSocket } from "./SocketProvider";
import { SidebarMenuBadge } from "@/components/ui/sidebar";

export function SidebarUnreadBadge() {
  const { unreadCount } = useSocket();

  if (unreadCount === 0) return null;

  return (
    <SidebarMenuBadge className="bg-red-500 text-white hover:bg-red-600 hover:text-white pointer-events-auto z-50">
      {unreadCount > 99 ? "99+" : unreadCount}
    </SidebarMenuBadge>
  );
}
