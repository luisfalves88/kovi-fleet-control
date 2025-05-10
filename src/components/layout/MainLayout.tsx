
import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Home, LogOut, User, Bell, FileText, Users, Settings, Menu } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine which menu items to show based on user role
  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/' },
      { icon: FileText, label: 'Tarefas', path: '/tasks' },
    ];

    // Items for admin and member only
    const adminMemberItems = [
      { icon: Bell, label: 'Conversações', path: '/conversations' },
      { icon: FileText, label: 'Relatórios', path: '/reports' },
    ];

    // Admin-only items
    const adminOnlyItems = [
      { icon: Users, label: 'Usuários', path: '/users' },
      { icon: Users, label: 'Parceiros', path: '/partners' },
      { icon: Settings, label: 'Unidades', path: '/units' },
    ];

    let items = [...baseItems];

    if (user?.role === 'admin' || user?.role === 'member') {
      items = [...items, ...adminMemberItems];
    }

    if (user?.role === 'admin') {
      items = [...items, ...adminOnlyItems];
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 left-4 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && (
        <div className={`${isMobile ? 'absolute z-40 h-full' : 'relative'}`}>
          <Sidebar className="h-screen border-r">
            <SidebarHeader className="px-6 py-5 flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" className="fill-kovi-red" />
                    <path d="M12 10C13.6569 10 15 8.65685 15 7H9C9 8.65685 10.3431 10 12 10Z" fill="#1A1F2C" />
                    <path d="M16 14H8C7.44772 14 7 14.4477 7 15C7 15.5523 7.44772 16 8 16H16C16.5523 16 17 15.5523 17 15C17 14.4477 16.5523 14 16 14Z" fill="#1A1F2C" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Kovi Fleet</span>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="px-4">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </SidebarContent>
            
            <SidebarFooter className="px-4 py-4 mt-auto">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || ''}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto w-full">
        <div className="container py-6 px-4 md:px-6 max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
