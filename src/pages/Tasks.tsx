
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { TaskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskStatus } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateTaskForm from "@/components/tasks/CreateTaskForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { getStatusPriority, getSlaStatus } from "@/lib/taskUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const Tasks = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "sla">("createdAt");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "kanban">("card");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  
  // Enhanced filtering state
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [slaFilter, setSlaFilter] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { data: tasks, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks", statusFilter, searchQuery, partnerFilter, dateFrom, dateTo, slaFilter, selectedStatuses],
    queryFn: () => TaskService.getTasks({
      status: statusFilter,
      search: searchQuery,
      partnerId: partnerFilter,
      dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
      dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
      slaStatus: slaFilter !== "all" ? slaFilter : undefined
    }),
  });

  // Get sorted tasks
  const sortedTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    let sortedList = [...tasks];
    
    // Apply selected statuses filter if any are selected
    if (selectedStatuses.length > 0) {
      sortedList = sortedList.filter(task => selectedStatuses.includes(task.status));
    }
    
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
    
    return sortedList;
  }, [tasks, sortBy, selectedStatuses]);

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

  const toggleStatusSelection = (status: TaskStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSlaFilter("all");
    setSelectedStatuses([]);
    setPartnerFilter("all");
    setStatusFilter("all");
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

  const slaOptions = [
    { value: "all", label: "Todos SLAs" },
    { value: "urgent", label: "Urgente (>24h)" },
    { value: "atrisk", label: "Em risco (12-24h)" },
    { value: "ontime", label: "No prazo (<12h)" },
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
          <Button 
            variant="outline" 
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="sm:w-[140px]"
          >
            {isFilterExpanded ? "Ocultar filtros" : "Mostrar filtros"}
            {selectedStatuses.length > 0 || slaFilter !== "all" || dateFrom || dateTo ? (
              <Badge variant="secondary" className="ml-2">
                {(selectedStatuses.length > 0 ? 1 : 0) + 
                 (slaFilter !== "all" ? 1 : 0) + 
                 (dateFrom || dateTo ? 1 : 0)}
              </Badge>
            ) : null}
          </Button>
          
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

      {isFilterExpanded && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Filtro por data</h3>
              <div className="flex gap-2 flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[140px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Data inicial'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[140px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Data final'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Filtro por SLA</h3>
              <Select value={slaFilter} onValueChange={setSlaFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="SLA status" />
                </SelectTrigger>
                <SelectContent>
                  {slaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Filtro por parceiro</h3>
              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger className="w-[180px]">
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
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Status (seleção múltipla)</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.filter(option => option.value !== "all").map((status) => (
                <Badge
                  key={status.value}
                  variant={selectedStatuses.includes(status.value as TaskStatus) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleStatusSelection(status.value as TaskStatus)}
                >
                  {status.label}
                  {selectedStatuses.includes(status.value as TaskStatus) && " ✓"}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        </div>
      )}

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
