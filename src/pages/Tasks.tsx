
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Filter, Plus, Search } from 'lucide-react';

// Mock data representing tasks
const mockTasks = [
  {
    id: '1',
    licensePlate: 'ABC1234',
    vehicleModel: 'Toyota Corolla',
    clientName: 'João Silva',
    status: 'allocate_driver',
    createdAt: new Date(),
    slaExpiration: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  },
  {
    id: '2',
    licensePlate: 'DEF5678',
    vehicleModel: 'Honda Civic',
    clientName: 'Maria Souza',
    status: 'pending_collection',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    slaExpiration: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
  },
  {
    id: '3',
    licensePlate: 'GHI9012',
    vehicleModel: 'VW Golf',
    clientName: 'Carlos Oliveira',
    status: 'collecting_route',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    slaExpiration: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago (violated)
  },
  {
    id: '4',
    licensePlate: 'JKL3456',
    vehicleModel: 'Hyundai HB20',
    clientName: 'Ana Costa',
    status: 'collected',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: '5',
    licensePlate: 'MNO7890',
    vehicleModel: 'Fiat Pulse',
    clientName: 'Paulo Santos',
    status: 'cancelled',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    cancelledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
  }
];

// Helper function to get status display info
const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string, className: string }> = {
    'allocate_driver': { label: 'Alocar Chofer', className: 'bg-blue-500' },
    'pending_collection': { label: 'Pendente de Recolha', className: 'bg-yellow-500' },
    'returned': { label: 'Devolvida', className: 'bg-orange-500' },
    'collecting_route': { label: 'Em Rota Recolha', className: 'bg-purple-500' },
    'unlock': { label: 'Desbloqueio', className: 'bg-indigo-500' },
    'kovi_route': { label: 'Em Rota Kovi', className: 'bg-teal-500' },
    'tow_request': { label: 'Solicitação de Guincho', className: 'bg-pink-500' },
    'tow_route': { label: 'Em Rota Guincho', className: 'bg-pink-700' },
    'analysis': { label: 'Em Análise', className: 'bg-amber-500' },
    'illegal_appropriation': { label: 'Apropriação Indébita', className: 'bg-red-700' },
    'collected': { label: 'Recolhido', className: 'bg-green-600' },
    'cancelled': { label: 'Cancelado', className: 'bg-gray-500' }
  };

  return statusMap[status] || { label: 'Desconhecido', className: 'bg-gray-500' };
};

// Helper function to get SLA status
const getSLAStatus = (slaExpiration?: Date) => {
  if (!slaExpiration || ['collected', 'cancelled'].includes(status)) {
    return { className: '', label: '' };
  }

  const now = new Date();
  const hoursRemaining = Math.floor((slaExpiration.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (hoursRemaining < 0) {
    return { className: 'sla-red', label: 'SLA Violado' };
  } else if (hoursRemaining < 24) {
    return { className: 'sla-yellow', label: 'SLA Próximo' };
  } else {
    return { className: 'sla-green', label: 'SLA OK' };
  }
};

const Tasks = () => {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<'cards' | 'kanban'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const canCreateTask = user?.role === 'admin' || user?.role === 'member';

  // Filter tasks based on search query and status filter
  const filteredTasks = mockTasks.filter(task => {
    // First apply search filter
    const searchMatch = !searchQuery || 
      task.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then apply status filter
    const statusMatch = !statusFilter || task.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tarefas</h2>
          <p className="text-muted-foreground">
            Gerencie as operações de recolha de veículos
          </p>
        </div>
        
        {canCreateTask && (
          <Button className="bg-kovi-red hover:bg-kovi-red/90">
            <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
          </Button>
        )}
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa ou cliente..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            onClick={() => setStatusFilter(null)}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'collected' ? "default" : "outline"}
            onClick={() => setStatusFilter('collected')}
          >
            Finalizados
          </Button>
          <Button
            variant={statusFilter === 'cancelled' ? "default" : "outline"}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelados
          </Button>
          <Button 
            variant="outline"
            size="icon"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View type selector */}
      <Tabs defaultValue="cards" className="w-full" onValueChange={(value) => setViewType(value as 'cards' | 'kanban')}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        
        {/* Cards view */}
        <TabsContent value="cards" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <Card key={task.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.licensePlate}</h3>
                      <Badge className={getStatusInfo(task.status).className}>
                        {getStatusInfo(task.status).label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.vehicleModel}</p>
                    <p className="text-sm">{task.clientName}</p>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-muted/50">
                    <div className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-2 h-4 w-4" /> Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Kanban view */}
        <TabsContent value="kanban" className="w-full">
          <div className="border rounded-lg p-4 min-h-[400px] bg-muted/30">
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-muted-foreground">Visualização Kanban</h3>
              <p className="text-sm text-muted-foreground">
                A visualização completa do Kanban estará disponível em breve
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
