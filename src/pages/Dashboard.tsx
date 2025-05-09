
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role as UserRole;
  
  // Mock data
  const pendingTasks = 18;
  const completedTasks = 45;
  const inProgressTasks = 12;
  const cancelledTasks = 5;
  
  const redSLA = 4; // Tarefas com SLA violado
  const yellowSLA = 6; // Tarefas próximas do vencimento
  const greenSLA = 8; // Tarefas com mais de 50% do tempo de SLA disponível
  
  // Data for different user roles
  const roleSpecificData = {
    admin: {
      title: 'Administrador',
      insight: 'Todas as operações de recolha',
      metrics: [
        { label: 'Total de usuários', value: 32 },
        { label: 'Parceiros ativos', value: 8 },
        { label: 'Unidades', value: 5 }
      ]
    },
    member: {
      title: 'Membro Kovi',
      insight: 'Operações de recolha',
      metrics: [
        { label: 'Pendentes de desbloqueio', value: 3 },
        { label: 'Em análise', value: 2 },
        { label: 'Apropriação indébita', value: 1 }
      ]
    },
    partner: {
      title: 'Parceiro',
      insight: 'Operações atribuídas',
      metrics: [
        { label: 'Tarefas atribuídas', value: 14 },
        { label: 'Motoristas disponíveis', value: 8 },
        { label: 'Taxa de sucesso', value: '87%' }
      ]
    },
    driver: {
      title: 'Chofer',
      insight: 'Suas atribuições',
      metrics: [
        { label: 'Em rota', value: 2 },
        { label: 'Pendentes', value: 3 },
        { label: 'Concluídas hoje', value: 1 }
      ]
    }
  };
  
  const currentRoleData = roleSpecificData[userRole] || roleSpecificData.member;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo(a) {user?.name}, sua visão geral das operações de recolha
        </p>
      </div>

      {/* Role specific metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {currentRoleData.metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {currentRoleData.insight}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Pendentes
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-yellow-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Recolhas aguardando processamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Em Progresso
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-blue-500"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Recolhas em processamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Finalizadas
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              +{completedTasks - 10} comparado ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Canceladas
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-red-500"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledTasks}</div>
            <p className="text-xs text-muted-foreground">
              {((cancelledTasks / (pendingTasks + inProgressTasks + completedTasks + cancelledTasks)) * 100).toFixed(1)}% do total de tarefas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status de SLA</CardTitle>
          <CardDescription>
            Indicador de tempo para cumprimento das tarefas pendentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">SLA violado</span>
                </div>
                <span className="text-sm">{redSLA} tarefas</span>
              </div>
              <Progress value={((redSLA / pendingTasks) * 100)} className="h-2 bg-slate-200" indicatorClassName="bg-red-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium">SLA próximo do vencimento</span>
                </div>
                <span className="text-sm">{yellowSLA} tarefas</span>
              </div>
              <Progress value={((yellowSLA / pendingTasks) * 100)} className="h-2 bg-slate-200" indicatorClassName="bg-yellow-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">SLA dentro do prazo</span>
                </div>
                <span className="text-sm">{greenSLA} tarefas</span>
              </div>
              <Progress value={((greenSLA / pendingTasks) * 100)} className="h-2 bg-slate-200" indicatorClassName="bg-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
