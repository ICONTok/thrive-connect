
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
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    title: "Users",
    icon: Users,
    url: "/users",
  },
  {
    title: "Calendar",
    icon: Calendar,
    url: "/calendar",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    url: "/messages",
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
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <img src="/placeholder.svg" alt="Logo" className="h-8" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className="flex items-center space-x-2 px-4 py-2 w-full hover:bg-gray-100 rounded-lg"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 px-4 py-2 w-full hover:bg-gray-100 rounded-lg text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
