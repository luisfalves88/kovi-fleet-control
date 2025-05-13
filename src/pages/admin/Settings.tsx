
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Users from './Users';
import Partners from './Partners';
import Units from './Units';

// Define the interface that all tab components will use
interface TabContentProps {
  isTab?: boolean;
}

// Type assertions to define the components with their props
const UsersTab = Users as React.ComponentType<TabContentProps>;
const PartnersTab = Partners as React.ComponentType<TabContentProps>;
const UnitsTab = Units as React.ComponentType<TabContentProps>;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, parceiros e unidades em um só lugar
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UsersTab isTab={true} />
        </TabsContent>
        
        <TabsContent value="partners" className="mt-6">
          <PartnersTab isTab={true} />
        </TabsContent>
        
        <TabsContent value="units" className="mt-6">
          <UnitsTab isTab={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
