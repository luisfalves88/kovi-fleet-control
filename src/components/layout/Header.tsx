
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfileMenu } from './UserProfileMenu';
import { NotificationBell } from '../notifications/NotificationBell';

export const Header = () => {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger />
        <div className="ml-auto flex items-center space-x-4">
          <NotificationBell />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};
