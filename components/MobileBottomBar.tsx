"use client";

import {
  Home,
  MessageCircle,
  PlusSquare,
  Search,
  User,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomBar({ username }: { username?: string }) {
  const pathname = usePathname();

  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Search",
      url: "/search",
      icon: Search,
    },
    {
      title: "Feed",
      url: "/feed",
      icon: Video,
    },
    {
      title: "Create",
      url: "/create",
      icon: PlusSquare,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageCircle,
    },
    {
      title: "Profile",
      url: username ? `/profile/${username}` : "/login",
      icon: User,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-6 mx-auto font-medium">
        {items.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`inline-flex flex-col items-center justify-center px-1 hover:bg-muted group ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon
                className={`w-6 h-6 mb-1 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary"
                }`}
              />
              <span className="text-xs">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
