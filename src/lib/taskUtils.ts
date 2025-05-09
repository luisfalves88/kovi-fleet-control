
import { TaskStatus } from "@/types/task";

export const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    allocateDriver: 'Alocar chofer',
    pendingCollection: 'Pendente de recolha',
    returned: 'Devolvida',
    onRouteCollection: 'Em rota recolha',
    unlock: 'Desbloqueio',
    onRouteKovi: 'Em rota Kovi',
    towRequest: 'Solicitação de guincho',
    onRouteTow: 'Em rota guincho',
    underAnalysis: 'Em análise',
    unlawfulAppropriation: 'Apropriação Indébita',
    collected: 'Recolhido',
    canceled: 'Cancelado'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const statusColorMap: Record<string, string> = {
    allocateDriver: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    pendingCollection: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    returned: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    onRouteCollection: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    unlock: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    onRouteKovi: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    towRequest: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    onRouteTow: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    underAnalysis: 'bg-lime-100 text-lime-800 hover:bg-lime-200',
    unlawfulAppropriation: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
    collected: 'bg-green-100 text-green-800 hover:bg-green-200',
    canceled: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };
  return statusColorMap[status] || 'bg-gray-100 text-gray-800';
};

// New utility functions
export const getStatusPriority = (status: string): number => {
  const priorityMap: Record<string, number> = {
    unlawfulAppropriation: 1, // Highest priority
    towRequest: 2,
    onRouteTow: 3,
    allocateDriver: 4,
    pendingCollection: 5,
    onRouteCollection: 6,
    underAnalysis: 7,
    unlock: 8,
    onRouteKovi: 9,
    collected: 10,
    returned: 11,
    canceled: 12 // Lowest priority
  };
  
  return priorityMap[status] || 99;
};

export const getSlaStatus = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const hoursSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (hoursSinceCreation >= 24) {
    return { color: "bg-red-100 text-red-800", text: "Urgente", priority: 1 };
  } else if (hoursSinceCreation >= 12) {
    return { color: "bg-yellow-100 text-yellow-800", text: "Em risco", priority: 2 };
  }
  return { color: "bg-green-100 text-green-800", text: "No prazo", priority: 3 };
};

export const getNextPossibleStatuses = (currentStatus: string): Array<{value: string, label: string}> => {
  const statusTransitions: Record<string, Array<{value: string, label: string}>> = {
    allocateDriver: [
      { value: 'pendingCollection', label: 'Pendente de recolha' },
      { value: 'canceled', label: 'Cancelar tarefa' }
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
      { value: 'allocateDriver', label: 'Alocar novo chofer' },
      { value: 'canceled', label: 'Cancelar tarefa' }
    ],
    collected: [
      { value: 'onRouteKovi', label: 'Em rota para Kovi' },
    ],
    onRouteKovi: [
      { value: 'underAnalysis', label: 'Em análise' }
    ],
    underAnalysis: [
      { value: 'unlock', label: 'Desbloquear' },
      { value: 'towRequest', label: 'Solicitar guincho' }
    ],
    towRequest: [
      { value: 'onRouteTow', label: 'Em rota de guincho' }
    ],
    onRouteTow: [
      { value: 'unlawfulAppropriation', label: 'Apropriação indébita' }
    ]
  };
  
  return statusTransitions[currentStatus] || [];
};
