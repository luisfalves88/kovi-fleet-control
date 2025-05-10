import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { TaskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskStatus } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateTaskForm from "@/components/tasks/CreateTaskForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { getStatusPriority, getSlaStatus } from "@/lib/taskUtils";

const Tasks = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "sla">("createdAt");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "kanban">("card");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");

  const { data: tasks, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks", statusFilter, searchQuery],
    queryFn: () => TaskService.getTasks({ status: statusFilter, search: searchQuery }),
  });

  // Get sorted tasks
  const sortedTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    let sortedList = [...tasks];
    
    if (sortBy === "priority") {
      sortedList.sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));
    } else if (sortBy === "sla") {
      sortedList.sort((a, b) => {
        const aSla = getSlaStatus(a.createdAt.toString()).priority;
        const bSla = getSlaStatus(b.createdAt.toString()).priority;
        return aSla - bSla;
      });
    } else {
      // Default: sort by creation date (newest first)
      sortedList.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    // Apply partner filter if needed
    if (partnerFilter !== "all") {
      sortedList = sortedList.filter(task => task.partnerId === partnerFilter);
    }
    
    return sortedList;
  }, [tasks, sortBy, partnerFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleCreateTask = async () => {
    setIsCreateDialogOpen(false);
    toast({
      title: "Tarefa criada",
      description: "A tarefa foi criada com sucesso.",
    });
    refetch();
  };

  // Filter and sort options
  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "allocateDriver", label: "Alocar chofer" },
    { value: "pendingCollection", label: "Pendente de recolha" },
    { value: "returned", label: "Devolvida" },
    { value: "onRouteCollection", label: "Em rota recolha" },
    { value: "unlock", label: "Desbloqueio" },
    { value: "onRouteKovi", label: "Em rota Kovi" },
    { value: "towRequest", label: "Solicitação de guincho" },
    { value: "onRouteTow", label: "Em rota guincho" },
    { value: "underAnalysis", label: "Em análise" },
    { value: "unlawfulAppropriation", label: "Apropriação Indébita" },
    { value: "collected", label: "Recolhido" },
    { value: "canceled", label: "Cancelado" },
  ];
  
  const partnerOptions = [
    { value: "all", label: "Todos parceiros" },
    { value: "1", label: "Parceiro A" },
    { value: "2", label: "Parceiro B" },
    { value: "3", label: "Parceiro C" },
  ];
  
  const sortOptions = [
    { value: "createdAt", label: "Data de criação" },
    { value: "priority", label: "Prioridade de status" },
    { value: "sla", label: "SLA (urgência)" },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        <p className="text-muted-foreground">
          Gerenciamento de tarefas de recolhas de veículos
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
          <Input
            placeholder="Buscar por placa ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={partnerFilter} onValueChange={setPartnerFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por parceiro" />
            </SelectTrigger>
            <SelectContent>
              {partnerOptions.map((partner) => (
                <SelectItem key={partner.value} value={partner.value}>
                  {partner.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "createdAt" | "priority" | "sla")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "card" | "kanban")}>
        <TabsList>
          <TabsTrigger value="card">Cartões</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        
        <TabsContent value="card" className="mt-4">
          {isLoading ? (
            <div className="text-center py-10">Carregando tarefas...</div>
          ) : isError ? (
            <div className="text-center py-10 text-red-500">
              Erro ao carregar tarefas. Tente novamente mais tarde.
            </div>
          ) : sortedTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {sortedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              Nenhuma tarefa encontrada com os filtros atuais.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="kanban" className="mt-4 w-full">
          {isLoading ? (
            <div className="text-center py-10">Carregando tarefas...</div>
          ) : isError ? (
            <div className="text-center py-10 text-red-500">
              Erro ao carregar tarefas. Tente novamente mais tarde.
            </div>
          ) : sortedTasks.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <KanbanBoard tasks={sortedTasks} onTaskUpdate={refetch} />
            </div>
          ) : (
            <div className="text-center py-10">
              Nenhuma tarefa encontrada com os filtros atuais.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar uma nova tarefa de recolha.
            </DialogDescription>
          </DialogHeader>
          <CreateTaskForm onSuccess={handleCreateTask} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
