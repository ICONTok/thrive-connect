
import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

// This component controls sidebar state based on the current route
const SidebarController = () => {
  const { setOpen } = useSidebar();
  const location = useLocation();
  
  useEffect(() => {
    // Auto-collapse sidebar on these routes
    const collapsibleRoutes = ['/messages', '/blog', '/connections'];
    const shouldCollapse = collapsibleRoutes.some(route => location.pathname.startsWith(route));
    
    if (shouldCollapse) {
      setOpen(false);
    }
  }, [location.pathname, setOpen]);
  
  return null;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarController />
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <nav className="bg-white border-b px-4 sticky top-0 z-10 shadow-sm w-full">
            <div className="flex h-16 items-center w-full">
              <div className="flex items-center space-x-4">
                <SidebarTrigger>
                  <Menu className="h-6 w-6 text-gray-600" />
                </SidebarTrigger>
                <h1 className="text-xl font-bold text-gray-900">Thrive</h1>
              </div>
            </div>
          </nav>

          <div className="flex-1 w-full overflow-auto">
            <div className="w-full h-full">{children}</div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
