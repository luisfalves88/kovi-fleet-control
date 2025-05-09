
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
import { Plus, MoreVertical, Search, Home, HomeIcon } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
}

// Mock Units
const mockUnits: Unit[] = [
  {
    id: 'u-1',
    name: 'Pátio São Paulo - Zona Leste',
    address: 'Av. Aricanduva, 5000, São Paulo, SP',
    isActive: true,
    createdAt: new Date(2023, 5, 10),
  },
  {
    id: 'u-2',
    name: 'Pátio São Paulo - Zona Sul',
    address: 'Av. Interlagos, 2000, São Paulo, SP',
    isActive: true,
    createdAt: new Date(2023, 8, 5),
  },
  {
    id: 'u-3',
    name: 'Pátio Rio de Janeiro',
    address: 'Av. Brasil, 15000, Rio de Janeiro, RJ',
    isActive: false,
    createdAt: new Date(2024, 1, 15),
  }
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  address: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres.",
  }),
});

const UnitsPage = () => {
  const { toast } = useToast();
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
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
    
    // Create a new unit
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      name: values.name,
      address: values.address,
      isActive: true,
      createdAt: new Date(),
    };
    
    setUnits([...units, newUnit]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Unidade cadastrada",
      description: "A unidade foi cadastrada com sucesso.",
    });
    
    form.reset();
  };
  
  const handleToggleStatus = (unitId: string) => {
    setUnits(units.map(unit => {
      if (unit.id === unitId) {
        const newStatus = !unit.isActive;
        toast({
          title: newStatus ? "Unidade ativada" : "Unidade desativada",
          description: `A unidade foi ${newStatus ? 'ativada' : 'desativada'} com sucesso.`,
        });
        return { ...unit, isActive: newStatus };
      }
      return unit;
    }));
  };

  // Filter units based on search query
  const filteredUnits = searchQuery
    ? units.filter(unit => 
        unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.address.toLowerCase().includes(searchQuery.toLowerCase()))
    : units;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unidades</h1>
        <p className="text-muted-foreground">
          Gerenciamento de unidades de entrega de veículos
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
          <Input
            placeholder="Buscar unidades..."
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
          Nova Unidade
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nome da Unidade</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="hidden md:table-cell w-[150px]">Status</TableHead>
              <TableHead className="hidden md:table-cell">Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhuma unidade encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.address}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={unit.isActive ? "default" : "secondary"}>
                      {unit.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(unit.createdAt), "dd/MM/yyyy")}
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
                        <DropdownMenuItem onClick={() => handleToggleStatus(unit.id)}>
                          {unit.isActive ? (
                            <>
                              <HomeIcon className="mr-2 h-4 w-4" />
                              Desativar Unidade
                            </>
                          ) : (
                            <>
                              <Home className="mr-2 h-4 w-4" />
                              Ativar Unidade
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

      {/* Create Unit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Unidade</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para cadastrar uma nova unidade de entrega.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Unidade</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome da unidade" />
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
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Endereço completo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar Unidade</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitsPage;
