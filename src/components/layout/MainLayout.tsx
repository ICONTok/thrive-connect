
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Home, Users, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <nav className="bg-white border-b px-4 sticky top-0 z-10 shadow-sm w-full">
            <div className="flex justify-between h-16 items-center max-w-full mx-auto">
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

          <div className="flex-1 p-4 md:p-6 overflow-auto w-full max-w-full">
            <div className="w-full max-w-full mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
