
import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Home, Users, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <SidebarController />
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <nav className="bg-white border-b px-4 sticky top-0 z-10 shadow-sm w-full">
            <div className="flex justify-between h-16 items-center w-full">
              <div className="flex items-center space-x-4">
                <SidebarTrigger>
                  <Menu className="h-6 w-6 text-gray-600" />
                </SidebarTrigger>
                <h1 className="text-xl font-bold text-gray-900">Thrive</h1>
                <div className="hidden md:flex items-center space-x-6">
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/')}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/connections')}>
                    <Users className="h-5 w-5" />
                    <span>Connections</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/messages')}>
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/blog')}>
                    <BookOpen className="h-5 w-5" />
                    <span>Blog</span>
                  </Button>
                </div>
              </div>
              <div className="md:hidden flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                  <Home className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/connections')}>
                  <Users className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/blog')}>
                  <BookOpen className="h-5 w-5" />
                </Button>
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
