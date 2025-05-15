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
import { useAuth } from '@/contexts/AuthContext';

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
          <Card>
            <CardHeader>
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
                <div>
                  <dt className="text-sm font-medium text-gray-500">Agendamento</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(task.scheduledAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: pt })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Additional cards as needed */}
        </div>

        {/* Actions sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>Gerencie o status e o motorista da tarefa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canAssignDriver && (
                <div>
                  <Button onClick={() => setIsAssignDriverDialogOpen(true)}>Alocar Motorista</Button>

                  {isAssignDriverDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
                        <h2 className="text-xl font-semibold">Alocar Motorista</h2>
                        <select
                          className="w-full border rounded p-2"
                          value={selectedDriverId}
                          onChange={(e) => {
                            const driver = mockDrivers.find(d => d.id === e.target.value);
                            setSelectedDriverId(e.target.value);
                            setSelectedDriverName(driver?.name || "");
                          }}
                        >
                          <option value="">Selecione um motorista</option>
                          {mockDrivers.map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAssignDriverDialogOpen(false)}>Cancelar</Button>
                          <Button onClick={handleAssignDriver} disabled={!selectedDriverId}>Confirmar</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {canCancelTask && (
                <div>
                  <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)}>Cancelar Tarefa</Button>

                  {isCancelDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
                        <h2 className="text-xl font-semibold">Cancelar Tarefa</h2>
                        <label className="block">
                          Motivo do cancelamento:
                          <select
                            className="w-full border rounded p-2 mt-1"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                          >
                            <option value="">Selecione um motivo</option>
                            {cancelReasons.map(reason => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          Comentários adicionais:
                          <textarea
                            className="w-full border rounded p-2 mt-1"
                            value={cancelComments}
                            onChange={(e) => setCancelComments(e.target.value)}
                            placeholder="Comentários adicionais (opcional)"
                          />
                        </label>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Cancelar</Button>
                          <Button
                            variant="destructive"
                            onClick={handleCancelTask}
                            disabled={!cancelReason}
                          >
                            Confirmar Cancelamento
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status update buttons */}
              {canUpdateStatus && (
                <div className="space-y-2">
                  {getAvailableStatusTransitions().map(transition => (
                    <Button
                      key={transition.value}
                      onClick={() => handleUpdateStatus(transition.value)}
                      className="w-full"
                    >
                      {transition.label}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper functions to get status name and color for badges
function getStatusName(status: string) {
  const map: Record<string, string> = {
    allocateDriver: "Alocar Motorista",
    pendingCollection: "Pendente de Recolha",
    onRouteCollection: "Em Rota de Recolha",
    returned: "Devolvida",
    collected: "Recolhido",
    onRouteKovi: "Em Rota para Kovi",
    canceled: "Cancelado"
  };
  return map[status] || status;
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    allocateDriver: "bg-yellow-200 text-yellow-800",
    pendingCollection: "bg-orange-200 text-orange-800",
    onRouteCollection: "bg-blue-200 text-blue-800",
    returned: "bg-gray-200 text-gray-800",
    collected: "bg-green-200 text-green-800",
    onRouteKovi: "bg-purple-200 text-purple-800",
    canceled: "bg-red-200 text-red-800"
  };
  return map[status] || "bg-gray-200 text-gray-800";
}
// Continuando o componente TaskDetail

// Dentro do componente TaskDetail, após os estados...

// Handler para alocar motorista
const handleAssignDriver = async () => {
  if (!selectedDriverId) return;
  try {
    await TaskService.assignDriver(task.id, selectedDriverId);
    alert(`Motorista ${selectedDriverName} alocado com sucesso!`);
    setIsAssignDriverDialogOpen(false);
    // Aqui você pode recarregar a task ou atualizar o estado local
  } catch (error) {
    alert("Erro ao alocar motorista. Tente novamente.");
  }
};

// Handler para cancelar tarefa
const handleCancelTask = async () => {
  if (!cancelReason) return;
  try {
    await TaskService.cancelTask(task.id, {
      reason: cancelReason,
      comments: cancelComments,
    });
    alert("Tarefa cancelada com sucesso.");
    setIsCancelDialogOpen(false);
    // Atualize o estado ou recarregue a tarefa
  } catch (error) {
    alert("Erro ao cancelar a tarefa. Tente novamente.");
  }
};

// Handler para atualizar status
const handleUpdateStatus = async (newStatus: string) => {
  try {
    await TaskService.updateStatus(task.id, newStatus);
    alert(`Status atualizado para: ${getStatusName(newStatus)}`);
    // Atualize o estado local ou recarregue a tarefa
  } catch (error) {
    alert("Erro ao atualizar o status. Tente novamente.");
  }
};

export default TaskDetail;
