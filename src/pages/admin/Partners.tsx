
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, MoreVertical, Search, Building, BuildingX } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string;
  isActive: boolean;
  createdAt: Date;
}

// Mock Partners
const mockPartners: Partner[] = [
  {
    id: 'p-1',
    name: 'Empresa Parceira A',
    cnpj: '12.345.678/0001-90',
    address: 'Av. Paulista, 1000, São Paulo, SP',
    responsibleName: 'João Silva',
    responsiblePhone: '(11) 98765-4321',
    responsibleEmail: 'joao@parceiroa.com',
    isActive: true,
    createdAt: new Date(2023, 5, 10),
  },
  {
    id: 'p-2',
    name: 'Empresa Parceira B',
    cnpj: '98.765.432/0001-10',
    address: 'Rua Augusta, 500, São Paulo, SP',
    responsibleName: 'Maria Souza',
    responsiblePhone: '(11) 91234-5678',
    responsibleEmail: 'maria@parceirob.com',
    isActive: true,
    createdAt: new Date(2023, 8, 5),
  },
  {
    id: 'p-3',
    name: 'Empresa Parceira C',
    cnpj: '45.678.901/0001-23',
    address: 'Av. Brasil, 2000, Rio de Janeiro, RJ',
    responsibleName: 'Carlos Ferreira',
    responsiblePhone: '(21) 98765-1234',
    responsibleEmail: 'carlos@parceiroc.com',
    isActive: false,
    createdAt: new Date(2024, 1, 15),
  }
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  cnpj: z.string().min(14, {
    message: "CNPJ deve ter pelo menos 14 caracteres.",
  }).max(18),
  address: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres.",
  }),
  responsibleName: z.string().min(2, {
    message: "Nome do responsável deve ter pelo menos 2 caracteres.",
  }),
  responsiblePhone: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 dígitos.",
  }),
  responsibleEmail: z.string().email({
    message: "Email inválido.",
  }),
});

const PartnersPage = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      address: "",
      responsibleName: "",
      responsiblePhone: "",
      responsibleEmail: "",
    },
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would query the API
    console.log("Searching for:", searchQuery);
  };
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real app, this would submit to an API
    console.log("Form values:", values);
    
    // Create a new partner
    const newPartner: Partner = {
      id: `partner-${Date.now()}`,
      name: values.name,
      cnpj: values.cnpj,
      address: values.address,
      responsibleName: values.responsibleName,
      responsiblePhone: values.responsiblePhone,
      responsibleEmail: values.responsibleEmail,
      isActive: true,
      createdAt: new Date(),
    };
    
    setPartners([...partners, newPartner]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Parceiro criado",
      description: "O parceiro foi cadastrado com sucesso.",
    });
    
    form.reset();
  };
  
  const handleToggleStatus = (partnerId: string) => {
    setPartners(partners.map(partner => {
      if (partner.id === partnerId) {
        const newStatus = !partner.isActive;
        toast({
          title: newStatus ? "Parceiro ativado" : "Parceiro desativado",
          description: `O parceiro foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
        });
        return { ...partner, isActive: newStatus };
      }
      return partner;
    }));
  };

  // Filter partners based on search query
  const filteredPartners = searchQuery
    ? partners.filter(partner => 
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.cnpj.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.responsibleName.toLowerCase().includes(searchQuery.toLowerCase()))
    : partners;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parceiros</h1>
        <p className="text-muted-foreground">
          Gerenciamento de empresas parceiras
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
          <Input
            placeholder="Buscar parceiros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Parceiro
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nome da Empresa</TableHead>
              <TableHead className="hidden md:table-cell">CNPJ</TableHead>
              <TableHead className="hidden md:table-cell">Responsável</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPartners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum parceiro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{partner.cnpj}</TableCell>
                  <TableCell className="hidden md:table-cell">{partner.responsibleName}</TableCell>
                  <TableCell className="hidden lg:table-cell">{partner.responsibleEmail}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={partner.isActive ? "default" : "secondary"}>
                      {partner.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(partner.id)}>
                          {partner.isActive ? (
                            <>
                              <BuildingX className="mr-2 h-4 w-4" />
                              Desativar Parceiro
                            </>
                          ) : (
                            <>
                              <Building className="mr-2 h-4 w-4" />
                              Ativar Parceiro
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Partner Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Parceiro</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para cadastrar uma nova empresa parceira.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome da empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="00.000.000/0000-00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Matriz</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Endereço completo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsibleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome completo do responsável" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responsiblePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(00) 00000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsibleEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="exemplo@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar Parceiro</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersPage;
