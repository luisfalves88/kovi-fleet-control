
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  // Mock data for the dashboard
  const stats = {
    pendingTasks: 28,
    completedTasks: 145,
    totalTasks: 173,
    slaCompliance: {
      violated: 7,
      atRisk: 12,
      onTrack: 9
    }
  };
  
  // Calculate percentages
  const completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
  const pendingRate = Math.round((stats.pendingTasks / stats.totalTasks) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de gerenciamento de recolhas Kovi
        </p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Completed Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Completadas
            </CardTitle>
            <CardDescription className="text-3xl font-bold">
              {stats.completedTasks}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({completionRate}%)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>23% no mês</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Pendentes
            </CardTitle>
            <CardDescription className="text-3xl font-bold">
              {stats.pendingTasks}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pendingRate}%)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <ArrowDownRight className="h-4 w-4" />
              <span>5% no mês</span>
            </div>
          </CardContent>
        </Card>

        {/* SLA Status */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status de SLA</CardTitle>
            <CardDescription>
              Monitoramento do tempo de atendimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-red-500" />
                  <span>SLA Violado</span>
                </div>
                <span className="font-semibold">{stats.slaCompliance.violated}</span>
              </div>
              <Progress 
                value={Math.round((stats.slaCompliance.violated / stats.pendingTasks) * 100)} 
                className="h-2 bg-gray-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>Em Risco</span>
                </div>
                <span className="font-semibold">{stats.slaCompliance.atRisk}</span>
              </div>
              <Progress 
                value={Math.round((stats.slaCompliance.atRisk / stats.pendingTasks) * 100)} 
                className="h-2 bg-gray-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>No Prazo</span>
                </div>
                <span className="font-semibold">{stats.slaCompliance.onTrack}</span>
              </div>
              <Progress 
                value={Math.round((stats.slaCompliance.onTrack / stats.pendingTasks) * 100)} 
                className="h-2 bg-gray-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
