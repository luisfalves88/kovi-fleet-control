import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Phone, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getStatusName, getStatusColor } from '@/lib/taskUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChatPanel } from '@/components/chat/ChatPanel';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [isAssignDriverDialogOpen, setIsAssignDriverDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedDriverName, setSelectedDriverName] = useState("");
  
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelComments, setCancelComments] = useState("");
  
  // Mock drivers data
  const mockDrivers = [
    { id: "d-1", name: "Carlos Motorista" },
    { id: "d-2", name: "Eduardo Motorista" },
    { id: "d-3", name: "Marcos Motorista" }
  ];
  
  // Mock cancel reasons
  const cancelReasons = [
    "Cliente realizou pagamento",
    "Cliente realizou acordo",
    "Faturas canceladas",
    "Troca de parceiro",
    "Em tratativa Safety/Pronta Resposta",
    "Realizou devolução voluntária",
    "Carro guinchado",
    "Carro apreendido",
    "Carro furtado ou roubado",
    "Sinistro",
    "Em oficina parceira",
    "Outros"
  ];

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ["task", id],
    queryFn: () => TaskService.getTaskById(id || ""),
    enabled: !!id,
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ taskId, driverId, driverName }: { taskId: string, driverId: string, driverName: string }) => 
      TaskService.assignDriver(taskId, driverId, driverName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      setIsAssignDriverDialogOpen(false);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status, comments }: { taskId: string, status: string, comments?: string }) => 
      TaskService.updateTaskStatus(taskId, status as any, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      setIsCancelDialogOpen(false);
      setCancelReason("");
      setCancelComments("");
    }
  });

  const handleAssignDriver = () => {
    if (id && selectedDriverId) {
      assignDriverMutation.mutate({
        taskId: id,
        driverId: selectedDriverId,
        driverName: selectedDriverName
      });
    }
  };

  const handleCancelTask = () => {
    if (id) {
      const comments = `${cancelReason}${cancelComments ? `: ${cancelComments}` : ''}`;
      updateStatusMutation.mutate({
        taskId: id,
        status: "canceled",
        comments
      });
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (id) {
      updateStatusMutation.mutate({
        taskId: id,
        status: newStatus as any
      });
    }
  };

  const getAvailableStatusTransitions = () => {
    if (!task) return [];
    
    // Define the allowed status transitions based on current status
    const transitions: Record<string, { value: string; label: string }[]> = {
      allocateDriver: [
        { value: 'pendingCollection', label: 'Pendente de recolha' }
      ],
      pendingCollection: [
        { value: 'onRouteCollection', label: 'Em rota de recolha' },
        { value: 'returned', label: 'Devolvida' },
        { value: 'allocateDriver', label: 'Voltar para alocação' },
      ],
      onRouteCollection: [
        { value: 'collected', label: 'Recolhido' },
        { value: 'returned', label: 'Devolvida' },
        { value: 'pendingCollection', label: 'Voltar para pendente' },
      ],
      returned: [
        { value: 'allocateDriver', label: 'Alocar novo chofer' }
      ],
      collected: [
        { value: 'onRouteKovi', label: 'Em rota para Kovi' },
      ],
      onRouteKovi: [
        { value: 'collected', label: 'Voltar para recolhido' }
      ]
    };
    
    return transitions[task.status] || [];
  };

  const canCancelTask = user?.role === 'admin' || user?.role === 'member';
  const canAssignDriver = task?.status === 'allocateDriver' && 
    (user?.role === 'admin' || user?.role === 'member' || user?.role === 'partner');
  
  const canUpdateStatus = user?.role === 'admin' || user?.role === 'member';

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Carregando detalhes da tarefa...</div>;
  }

  if (isError || !task) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">Erro ao carregar detalhes da tarefa</p>
        <Button onClick={() => navigate('/tasks')}>Voltar para lista de tarefas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/tasks')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {task.plate}
            <Badge className={getStatusColor(task.status)}>
              {getStatusName(task.status)}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Detalhes da tarefa de recolha
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Information */}
        <div className="lg:col-span-2 space-y-6">
          <CardTitle>Detalhes do Veículo</CardTitle>
</CardHeader>
<CardContent>
  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
    <div>
      <dt className="text-sm font-medium text-gray-500">Placa</dt>
      <dd className="mt-1 text-sm text-gray-900">{task.plate}</dd>
    </div>
    <div>
      <dt className="text-sm font-medium text-gray-500">Modelo</dt>
      <dd className="mt-1 text-sm text-gray-900">{task.vehicleModel}</dd>
    </div>
    <div>
      <dt className="text-sm font-medium text-gray-500">Cliente</dt>
      <dd className="mt-1 text-sm text-gray-900">{task.customerName}</dd>
    </div>
    <div>
      <dt className="text-sm font-medium text-gray-500">Telefone</dt>
      <dd className="mt-1 text-sm text-gray-900">
        <div className="flex items-center">
          {task.phone}
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </dd>
    </div>
    {task.optionalPhone && (
      <div>
        <dt className="text-sm font-medium text-gray-500">Telefone Opcional</dt>
        <dd className="mt-1 text-sm text-gray-900">
          <div className="flex items-center">
            {task.optionalPhone}
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </dd>
      </div>
    )}
    {task.driverLink && (
      <div className="sm:col-span-2">
        <dt className="text-sm font-medium text-gray-500">Rental</dt>
        <dd className="mt-1 text-sm text-gray-900">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              asChild
            >
              <a href={task.driverLink} target="_blank" rel="noopener noreferrer">
                Perfil do Motorista
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>

            {(user?.role === "Administrador" || user?.role === "Membro Kovi") && (
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-2"
                asChild
              >
                <a href={task.driverLink} target="_blank" rel="noopener noreferrer">
                  Rental
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </dd>
      </div>
    )}
  </dl>
</CardContent>
</Card>


          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Endereço de Cadastro</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.registeredAddress}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Endereço Atual</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center">
                      {task.currentAddress}
                      {task.googleMapsLink && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2"
                          asChild
                        >
                          <a href={task.googleMapsLink} target="_blank" rel="noopener noreferrer">
                            Ver no Mapa
                          </a>
                        </Button>
                      )}
                    </div>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {task.observations && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{task.observations}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
              <CardDescription>Timeline de eventos da tarefa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {task.history.map((item, index) => (
                  <div key={item.id} className="relative pl-8 pb-4">
                    {index !== task.history.length - 1 && (
                      <div className="absolute left-3 top-3 h-full w-px bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <Calendar className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      {item.comments && <p className="text-sm text-gray-500">{item.comments}</p>}
                      <p className="text-xs text-gray-500 flex gap-1 items-center">
                        <span>{format(new Date(item.timestamp), "dd/MM/yyyy HH:mm", { locale: pt })}</span>
                        <span>•</span>
                        <span>{item.userName}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canAssignDriver && (
                <Button 
                  className="w-full" 
                  onClick={() => setIsAssignDriverDialogOpen(true)}
                >
                  Alocar Chofer
                </Button>
              )}

              {canUpdateStatus && task.status !== 'canceled' && task.status !== 'collected' && getAvailableStatusTransitions().length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="w-full"
                      variant="outline"
                    >
                      Atualizar Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Alterar para</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {getAvailableStatusTransitions().map((transition) => (
                        <DropdownMenuItem
                          key={transition.value}
                          onClick={() => handleUpdateStatus(transition.value)}
                        >
                          {transition.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {canCancelTask && task.status !== 'canceled' && task.status !== 'collected' && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  Cancelar Tarefa
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID da Tarefa</p>
                <p className="text-sm">{task.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p className="text-sm">{format(new Date(task.createdAt), "dd/MM/yyyy HH:mm", { locale: pt })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Empresa Parceira</p>
                <p className="text-sm">{task.partnerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Unidade de Entrega</p>
                <p className="text-sm">{task.unitName}</p>
              </div>
              {task.assignedDriverName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Motorista Alocado</p>
                  <p className="text-sm">{task.assignedDriverName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Replace the placeholder with the actual ChatPanel */}
          <ChatPanel taskId={task.id} taskPlate={task.plate} />
        </div>
      </div>

      {/* Driver Assignment Dialog */}
      <Dialog open={isAssignDriverDialogOpen} onOpenChange={setIsAssignDriverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alocar Motorista</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Selecione um motorista para alocar a esta tarefa.
            </p>
            <div className="space-y-2">
              {mockDrivers.map(driver => (
                <div 
                  key={driver.id}
                  className={`p-3 flex items-center gap-3 rounded-md cursor-pointer border transition-colors ${
                    selectedDriverId === driver.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedDriverId(driver.id);
                    setSelectedDriverName(driver.name);
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{driver.name}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDriverDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignDriver}
              disabled={!selectedDriverId || assignDriverMutation.isPending}
            >
              {assignDriverMutation.isPending ? "Alocando..." : "Alocar Motorista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Task Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Motivo do cancelamento</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cancelReasons.map(reason => (
                  <div 
                    key={reason}
                    className={`p-2 text-sm flex items-center gap-2 rounded-md cursor-pointer border transition-colors ${
                      cancelReason === reason 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setCancelReason(reason)}
                  >
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Justificativa</p>
              <Textarea
                placeholder="Detalhes adicionais sobre o cancelamento..."
                value={cancelComments}
                onChange={e => setCancelComments(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelTask}
              disabled={!cancelReason || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
