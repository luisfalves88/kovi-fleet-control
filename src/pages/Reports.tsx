
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Download, BarChart, PieChart, LineChart as LineChartIcon } from "lucide-react";
import { LineChart, BarChart as BarChartReact, PieChart as PieChartReact } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";

const ReportsPage = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("tasks");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });

  const handleGenerateReport = () => {
    toast({
      title: "Gerando relatório...",
      description: "O relatório será baixado em alguns instantes.",
    });

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Relatório gerado",
        description: "O relatório foi gerado e baixado com sucesso.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Geração de relatórios e análise de dados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório</CardTitle>
          <CardDescription>
            Selecione os parâmetros para gerar um relatório personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <Select 
                  value={reportType} 
                  onValueChange={setReportType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tasks">Tarefas</SelectItem>
                    <SelectItem value="drivers">Motoristas</SelectItem>
                    <SelectItem value="partners">Parceiros</SelectItem>
                    <SelectItem value="sla">Análise de SLA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Selecione um período</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={pt}
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => 
                          setDateRange({ 
                            from: range?.from, 
                            to: range?.to 
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleGenerateReport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="table">Tabela de Dados</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Tarefas por Status</CardTitle>
                  <CardDescription>Última semana</CardDescription>
                </div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <PieChartReact
                  data={{
                    labels: [
                      'Aguardando Alocação',
                      'Pendente Recolha',
                      'Recolhido',
                      'Cancelado',
                      'Em Análise'
                    ],
                    datasets: [
                      {
                        label: 'Tarefas',
                        data: [12, 19, 15, 8, 5],
                        backgroundColor: [
                          '#fcd34d',
                          '#60a5fa',
                          '#10b981',
                          '#9ca3af',
                          '#a78bfa'
                        ]
                      }
                    ]
                  }}
                  height="220px"
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 10,
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Tarefas por Parceiro</CardTitle>
                  <CardDescription>Último mês</CardDescription>
                </div>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <BarChartReact
                  data={{
                    labels: ['Parceiro A', 'Parceiro B', 'Parceiro C'],
                    datasets: [
                      {
                        label: 'Concluídas',
                        data: [22, 18, 15],
                        backgroundColor: '#10b981',
                      },
                      {
                        label: 'Pendentes',
                        data: [8, 6, 10],
                        backgroundColor: '#60a5fa',
                      },
                      {
                        label: 'Canceladas',
                        data: [5, 4, 3],
                        backgroundColor: '#9ca3af',
                      }
                    ]
                  }}
                  height="220px"
                  options={{
                    responsive: true,
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Tempo Médio de Recolha</CardTitle>
                  <CardDescription>Por mês</CardDescription>
                </div>
                <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <LineChart
                  data={{
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [
                      {
                        label: 'Tempo (horas)',
                        data: [12, 10, 8, 9, 7, 6],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        fill: true,
                      }
                    ]
                  }}
                  height="220px"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance de Recolha por Região</CardTitle>
              <CardDescription>
                Comparativo do último trimestre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartReact
                data={{
                  labels: ['São Paulo - Centro', 'São Paulo - Zona Leste', 'São Paulo - Zona Sul', 'São Paulo - Zona Oeste', 'Rio de Janeiro', 'Belo Horizonte'],
                  datasets: [
                    {
                      label: 'Tempo Médio (horas)',
                      data: [8, 12, 9, 10, 14, 11],
                      backgroundColor: '#8b5cf6',
                    },
                    {
                      label: 'Taxa de Sucesso (%)',
                      data: [85, 78, 82, 80, 75, 82],
                      backgroundColor: '#10b981',
                    }
                  ]
                }}
                height="300px"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Dados Brutos</CardTitle>
              <CardDescription>
                Visualize os dados antes de exportar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parceiro</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">T-001</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ABC1234</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">João Silva</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parceiro A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Recolhido</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">06/05/2024</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">T-002</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">DEF5678</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Maria Souza</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parceiro B</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pendente</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">05/05/2024</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">T-003</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">GHI9012</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Carlos Ferreira</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parceiro A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Cancelado</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">04/05/2024</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">T-004</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">JKL3456</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ana Oliveira</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parceiro C</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Em Análise</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">03/05/2024</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">T-005</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">MNO7890</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pedro Santos</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parceiro B</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Recolhido</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">02/05/2024</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
