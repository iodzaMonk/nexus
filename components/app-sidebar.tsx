import {
  Video,
  Home,
  MessageCircle,
  User,
  Search,
  PlusSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/user";

export async function AppSidebar() {
  const user = await getCurrentUser();

  // Menu items.
  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
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
      title: "Search",
      url: "/search",
      icon: Search,
    },
    {
      title: "Profile",
      url: `/profile/${user?.username}`,
      icon: User,
    },
  ];
  return (
    <Sidebar className="hidden md:flex">
      <SidebarContent>
        <SidebarGroup className="my-20 ml-5 w-auto">
          <SidebarGroupLabel className="text-4xl mb-5 text-white">
            Nexus
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
