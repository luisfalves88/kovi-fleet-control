import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  ChevronDown,
  Plus,
  Filter,
  Search,
  Building,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const mockPartners = [
  {
    id: 1,
    name: "Parceiro A",
    contact: "João Silva",
    phone: "11 99999-9999",
    email: "joao@parceiroa.com.br",
    address: "Rua A, 123 - São Paulo, SP",
    status: "Ativo",
    units: 5,
    activeTasks: 22,
    completionRate: 85,
  },
  {
    id: 2,
    name: "Parceiro B",
    contact: "Maria Souza",
    phone: "21 88888-8888",
    email: "maria@parceirob.com.br",
    address: "Av. B, 456 - Rio de Janeiro, RJ",
    status: "Inativo",
    units: 3,
    activeTasks: 15,
    completionRate: 78,
  },
  {
    id: 3,
    name: "Parceiro C",
    contact: "Carlos Ferreira",
    phone: "31 77777-7777",
    email: "carlos@parceiroc.com.br",
    address: "Travessa C, 789 - Belo Horizonte, MG",
    status: "Ativo",
    units: 8,
    activeTasks: 30,
    completionRate: 92,
  },
];

const Partners = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [partners, setPartners] = useState(mockPartners);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleCreatePartner = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSavePartner = () => {
    toast({
      title: "Parceiro criado",
      description: "O parceiro foi criado com sucesso.",
    });
    setOpen(false);
  };

  const handleEditPartner = (id) => {
    toast({
      title: "Parceiro atualizado",
      description: "O parceiro foi atualizado com sucesso.",
    });
  };

  const handleDeletePartner = (id) => {
    setPartners(partners.filter((partner) => partner.id !== id));
    toast({
      title: "Parceiro excluído",
      description: "O parceiro foi excluído com sucesso.",
    });
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedPartners = React.useMemo(() => {
    if (!sortColumn) return partners;

    return [...partners].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [partners, sortColumn, sortDirection]);

  const filteredPartners = sortedPartners.filter((partner) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parceiros</h1>
        <p className="text-muted-foreground">
          Gerenciar parceiros e suas informações
        </p>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Lista de Parceiros</CardTitle>
          <Button onClick={handleCreatePartner}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Parceiro
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Input
                    type="search"
                    placeholder="Buscar parceiro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline" size="sm" className="ml-2">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Ações em massa
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Ativar selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Desativar selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Excluir selecionados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox />
                      </TableHead>
                      <TableHead onClick={() => handleSort("name")}>
                        Nome
                        {sortColumn === "name" && (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </TableHead>
                      <TableHead onClick={() => handleSort("contact")}>
                        Contato
                        {sortColumn === "contact" && (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </TableHead>
                      <TableHead onClick={() => handleSort("email")}>
                        Email
                        {sortColumn === "email" && (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">
                          <Checkbox />
                        </TableCell>
                        <TableCell>{partner.name}</TableCell>
                        <TableCell>{partner.contact}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>
                          {partner.status === "Ativo" ? (
                            <Badge variant="outline">Ativo</Badge>
                          ) : (
                            <Badge>Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditPartner(partner.id)}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePartner(partner.id)}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="active">
              <div>
                <p>Lista de parceiros ativos.</p>
              </div>
            </TabsContent>
            <TabsContent value="inactive">
              <div>
                <p>Lista de parceiros inativos.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Parceiro</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar um novo parceiro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" defaultValue="Antonio Silva" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contato
              </Label>
              <Input id="contact" defaultValue="antonio@email.com" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSavePartner}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partners;
