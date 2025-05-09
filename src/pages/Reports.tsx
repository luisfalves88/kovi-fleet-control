
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Download, Filter, Users, FileText, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("task");
  const [reportPeriod, setReportPeriod] = useState("this-month");
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Visualize e exporte dados do sistema
        </p>
      </div>

      {/* Report type tabs */}
      <Tabs defaultValue="task" onValueChange={setReportType}>
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="task">
            <FileText className="h-4 w-4 mr-2" />
            Tarefas
          </TabsTrigger>
          <TabsTrigger value="user">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>
        
        {/* Tasks report */}
        <TabsContent value="task" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Relatório de Tarefas</CardTitle>
                <CardDescription>
                  Exporte dados detalhados de todas as tarefas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="period" className="text-sm font-medium leading-none">
                        Período
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-[240px] justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="status" className="text-sm font-medium leading-none">
                        Status
                      </label>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[240px]">
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="allocate_driver">Alocar Chofer</SelectItem>
                          <SelectItem value="pending_collection">Pendente de Recolha</SelectItem>
                          <SelectItem value="collected">Recolhido</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="partner" className="text-sm font-medium leading-none">
                        Parceiro
                      </label>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[240px]">
                          <SelectValue placeholder="Selecione um parceiro" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os parceiros</SelectItem>
                          <SelectItem value="1">Recolha Express</SelectItem>
                          <SelectItem value="2">Transportes Seguro</SelectItem>
                          <SelectItem value="3">GuinchoFácil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Limpar filtros</Button>
                <Button className="bg-kovi-red hover:bg-kovi-red/90">
                  <Download className="mr-2 h-4 w-4" /> Exportar Excel
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Prévia do Relatório</CardTitle>
              <CardDescription>
                Visualização dos dados que serão exportados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Última Atualização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>101</TableCell>
                    <TableCell>ABC1234</TableCell>
                    <TableCell>João Silva</TableCell>
                    <TableCell>Recolha Express</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500">Alocar Chofer</Badge>
                    </TableCell>
                    <TableCell>10/05/2023</TableCell>
                    <TableCell>10/05/2023</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>102</TableCell>
                    <TableCell>XYZ5678</TableCell>
                    <TableCell>Maria Souza</TableCell>
                    <TableCell>Transportes Seguro</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">Pendente de Recolha</Badge>
                    </TableCell>
                    <TableCell>15/04/2023</TableCell>
                    <TableCell>20/04/2023</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>103</TableCell>
                    <TableCell>DEF9012</TableCell>
                    <TableCell>Carlos Oliveira</TableCell>
                    <TableCell>GuinchoFácil</TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">Recolhido</Badge>
                    </TableCell>
                    <TableCell>20/03/2023</TableCell>
                    <TableCell>25/03/2023</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>104</TableCell>
                    <TableCell>GHI3456</TableCell>
                    <TableCell>Ana Costa</TableCell>
                    <TableCell>Recolha Express</TableCell>
                    <TableCell>
                      <Badge className="bg-gray-500">Cancelado</Badge>
                    </TableCell>
                    <TableCell>05/03/2023</TableCell>
                    <TableCell>07/03/2023</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users report placeholder */}
        <TabsContent value="user" className="space-y-4">
          <div className="flex justify-center p-12 border rounded-lg bg-muted/30">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Relatório de Usuários</h3>
              <p className="text-muted-foreground">
                Dados de atividade de usuários estarão disponíveis em breve
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Performance report placeholder */}
        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-center p-12 border rounded-lg bg-muted/30">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Relatório de Performance</h3>
              <p className="text-muted-foreground">
                Métricas de performance estarão disponíveis em breve
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
