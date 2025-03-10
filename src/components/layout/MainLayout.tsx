import { ReactNode, useEffect } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import { Menu, Users, MessageSquare, BookOpen } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const SidebarController = () => {
  const { setOpen } = useSidebar();
  const location = useLocation();
  
  useEffect(() => {
    const collapsibleRoutes = ['/messages', '/blog', '/connections'];
    const shouldCollapse = collapsibleRoutes.some(route => location.pathname.startsWith(route));
    
    if (shouldCollapse) {
      setOpen(false);
    }
  }, [location.pathname, setOpen]);
  
  return null;
};

export function MainLayout() {
  const location = useLocation();

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

              <div className="ml-auto flex items-center space-x-6">
                <Link 
                  to="/connections" 
                  className={`flex items-center space-x-1 text-sm font-medium ${location.pathname.startsWith('/connections') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Users className="h-4 w-4" />
                  <span>Connections</span>
                </Link>
                <Link 
                  to="/messages" 
                  className={`flex items-center space-x-1 text-sm font-medium ${location.pathname.startsWith('/messages') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
                <Link 
                  to="/blog" 
                  className={`flex items-center space-x-1 text-sm font-medium ${location.pathname.startsWith('/blog') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Blog</span>
                </Link>
              </div>
            </div>
          </nav>

          <div className="flex-1 w-full overflow-auto p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
