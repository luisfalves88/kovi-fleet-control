
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
