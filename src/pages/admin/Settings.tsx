
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from './Users';
import { Partners } from './Partners';
import { Units } from './Units';

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
          <Users isTab={true} />
        </TabsContent>
        
        <TabsContent value="partners" className="mt-6">
          <Partners isTab={true} />
        </TabsContent>
        
        <TabsContent value="units" className="mt-6">
          <Units isTab={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
