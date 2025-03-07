
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    title: "Connections",
    icon: Users,
    url: "/connections",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    url: "/messages",
  },
  {
    title: "Calendar",
    icon: Calendar,
    url: "/calendar",
  },
  {
    title: "Blog",
    icon: BookOpen,
    url: "/blog",
  },
  {
    title: "Notifications",
    icon: Bell,
    url: "/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // Get current page to determine active item
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible={isCollapsed ? "icon" : "offcanvas"}>
      <SidebarContent>
        <div className="p-4">
          <img src="/placeholder.svg" alt="Logo" className="h-8" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 w-full rounded-lg transition-colors",
                      currentPath === item.url || currentPath.startsWith(item.url + '/')
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "hover:bg-gray-100"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      currentPath === item.url || currentPath.startsWith(item.url + '/')
                        ? "text-[hsl(var(--primary))]"
                        : ""
                    )} />
                    <span className={cn(
                      "sidebar-text",
                      isCollapsed ? "sidebar-label hidden" : ""
                    )}>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut()}
                  tooltip={isCollapsed ? "Sign Out" : undefined}
                  className="flex items-center space-x-2 px-4 py-2 w-full hover:bg-gray-100 rounded-lg text-red-600 mt-4"
                >
                  <LogOut className="h-5 w-5 sidebar-icon" />
                  <span className={cn(
                    "sidebar-text",
                    isCollapsed ? "sidebar-label hidden" : ""
                  )}>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
