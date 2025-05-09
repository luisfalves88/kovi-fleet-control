
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { ArrowRightIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const mockTasks = {
  pending: 32,
  completed: 45,
  overdue: 8,
  almostOverdue: 6,
  onTime: 18,
  total: 45 + 32
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Tarefas Criadas',
        data: [18, 25, 32, 28, 36, 42],
        backgroundColor: "#3b82f6",
        borderColor: "#60a5fa",
      },
      {
        label: 'Tarefas Concluídas',
        data: [15, 20, 28, 25, 30, 35],
        backgroundColor: "#10b981",
        borderColor: "#34d399",
      }
    ]
  };

  const completionRate = [
    {
      name: 'Parceiro A',
      rate: 85
    },
    {
      name: 'Parceiro B',
      rate: 78
    },
    {
      name: 'Parceiro C',
      rate: 92
    }
  ];

  const taskStatusDistribution = {
    labels: [
      'Aguardando Alocação',
      'Pendente Recolha',
      'Em Rota',
      'Desbloqueio',
      'Análise',
      'Cancelada'
    ],
    datasets: [
      {
        label: 'Tarefas por Status',
        data: [12, 8, 6, 4, 2, 3],
        backgroundColor: [
          '#fcd34d',
          '#60a5fa',
          '#6366f1',
          '#ec4899',
          '#a78bfa',
          '#9ca3af'
        ]
      }
    ]
  };

  const recentActivity = [
    { id: 1, plate: 'ABC1234', action: 'Tarefa Criada', time: '10 min atrás' },
    { id: 2, plate: 'DEF5678', action: 'Chofer Alocado', time: '45 min atrás' },
    { id: 3, plate: 'GHI9012', action: 'Veículo Recolhido', time: '2 horas atrás' },
    { id: 4, plate: 'JKL3456', action: 'Tarefa Cancelada', time: '3 horas atrás' },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.name}! Veja o resumo das tarefas de recolha.
        </p>
      </div>

      {/* SLA Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dentro do SLA</CardTitle>
            <CardDescription>Tarefas com menos de 50% do SLA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockTasks.onTime}</div>
            <Progress value={56} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">56% do total de tarefas pendentes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">SLA em Atenção</CardTitle>
            <CardDescription>Tarefas com mais de 50% do SLA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockTasks.almostOverdue}</div>
            <Progress value={19} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">19% do total de tarefas pendentes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">SLA Violado</CardTitle>
            <CardDescription>Tarefas com SLA expirado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockTasks.overdue}</div>
            <Progress value={25} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">25% do total de tarefas pendentes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTasks.total}</div>
                <p className="text-xs text-muted-foreground">+12% do mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTasks.pending}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span>4% de aumento desde ontem</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recolhidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTasks.completed}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span>12% de aumento desde ontem</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((mockTasks.completed / mockTasks.total) * 100)}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span>3% de queda desde ontem</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho Mensal</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart
                  data={chartData}
                  options={{
                    scales: {
                      x: {
                        stacked: false,
                      },
                      y: {
                        stacked: false,
                      },
                    },
                  }}
                  height="300px"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PieChart
                  data={taskStatusDistribution}
                  height="300px"
                  width="100%"
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conclusão por Parceiro</CardTitle>
              <CardDescription>
                Performance dos principais parceiros na última semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completionRate.map((partner) => (
                  <div key={partner.name} className="flex items-center">
                    <div className="w-[160px] flex-shrink-0">
                      <p className="text-sm font-medium">{partner.name}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${
                            partner.rate >= 90 ? "bg-green-500" :
                            partner.rate >= 75 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${partner.rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-[60px] text-right">
                      <p className="text-sm font-medium">{partner.rate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Recolha</CardTitle>
              <CardDescription>
                Análise de tendências nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={{
                  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                  datasets: [
                    {
                      label: 'Taxa de Sucesso',
                      data: [65, 70, 75, 68, 82, 88],
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      fill: true,
                    },
                    {
                      label: 'Taxa de Cancelamento',
                      data: [15, 12, 10, 14, 8, 6],
                      borderColor: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      fill: true,
                    },
                  ],
                }}
                height="300px"
              />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Motivos de Cancelamento</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={{
                    labels: [
                      'Pagamento Realizado',
                      'Acordo com Cliente',
                      'Troca de Parceiro',
                      'Veículo não Localizado',
                      'Outros',
                    ],
                    datasets: [
                      {
                        data: [35, 25, 15, 18, 7],
                        backgroundColor: [
                          '#3b82f6',
                          '#10b981',
                          '#f59e0b',
                          '#ef4444',
                          '#6366f1',
                        ],
                      },
                    ],
                  }}
                  height="250px"
                  options={{
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Recolha</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={{
                    labels: ['Parceiro A', 'Parceiro B', 'Parceiro C', 'Parceiro D'],
                    datasets: [
                      {
                        label: 'Horas',
                        data: [12, 9, 15, 7],
                        backgroundColor: '#8b5cf6',
                      },
                    ],
                  }}
                  height="250px"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.plate} - {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tasks/${activity.id}`)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/tasks')}>
                Ver Todas as Tarefas
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
