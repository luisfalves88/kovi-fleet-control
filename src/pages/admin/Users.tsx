
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, MoreVertical, Search, RefreshCcw, Lock, UserCog } from "lucide-react";
import { User, UserRole } from '@/types';

// Mock Users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Kovi',
    email: 'admin@kovi.com.br',
    role: 'admin',
    company: 'Kovi',
    isActive: true,
    createdAt: new Date(2023, 5, 10),
  },
  {
    id: '2',
    name: 'Membro Kovi',
    email: 'member@kovi.com.br',
    role: 'member',
    company: 'Kovi',
    isActive: true,
    createdAt: new Date(2023, 8, 5),
  },
  {
    id: '3',
    name: 'Parceiro Exemplo',
    email: 'partner@example.com',
    role: 'partner',
    company: 'Empresa Parceira',
    isActive: true,
    createdAt: new Date(2024, 1, 15),
  },
  {
    id: '4',
    name: 'Motorista Exemplo',
    email: 'driver@example.com',
    role: 'driver',
    company: 'Empresa Parceira',
    isActive: true,
    createdAt: new Date(2024, 2, 20),
  },
  {
    id: '5',
    name: 'Usuário Inativo',
    email: 'inactive@example.com',
    role: 'member',
    company: 'Kovi',
    isActive: false,
    createdAt: new Date(2023, 3, 12),
  },
];

// Mock Companies
const mockCompanies = [
  { id: 'comp-1', name: 'Kovi' },
  { id: 'comp-2', name: 'Empresa Parceira A' },
  { id: 'comp-3', name: 'Empresa Parceira B' },
  { id: 'comp-4', name: 'Empresa Parceira C' },
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  cpf: z.string().min(11, {
    message: "CPF deve ter 11 dígitos.",
  }).max(14, {
    message: "CPF deve ter no máximo 14 caracteres.",
  }),
  phone: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 dígitos.",
  }),
  role: z.enum(['admin', 'member', 'partner', 'driver']),
  company: z.string(),
});

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      role: "member",
      company: "Kovi",
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
    
    // Create a new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: values.name,
      email: values.email,
      role: values.role as UserRole,
      company: values.company,
      isActive: true,
      createdAt: new Date(),
    };
    
    setUsers([...users, newUser]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Usuário criado",
      description: "O usuário foi criado com sucesso.",
    });
    
    form.reset();
  };
  
  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = !user.isActive;
        toast({
          title: newStatus ? "Usuário ativado" : "Usuário desativado",
          description: `O usuário foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
        });
        return { ...user, isActive: newStatus };
      }
      return user;
    }));
  };
  
  const handleResetPassword = (userId: string) => {
    setSelectedUserId(userId);
    setIsResetPasswordDialogOpen(true);
  };
  
  const confirmResetPassword = () => {
    toast({
      title: "Senha redefinida",
      description: "Uma nova senha foi enviada para o email do usuário.",
    });
    setIsResetPasswordDialogOpen(false);
    setSelectedUserId(null);
  };

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerenciamento de usuários do sistema
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
          <Input
            placeholder="Buscar usuários..."
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
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Função</TableHead>
              <TableHead className="hidden md:table-cell">Empresa</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.role === 'admin' ? 'Administrador' :
                     user.role === 'member' ? 'Membro Kovi' :
                     user.role === 'partner' ? 'Parceiro' : 'Motorista'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.company}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(user.createdAt), "dd/MM/yyyy")}
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
                        <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                          <Lock className="mr-2 h-4 w-4" />
                          Redefinir Senha
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          {user.isActive ? "Desativar" : "Ativar"} Usuário
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

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para cadastrar um novo usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome completo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="exemplo@email.com" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="000.000.000-00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(00) 00000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="member">Membro Kovi</SelectItem>
                          <SelectItem value="partner">Parceiro</SelectItem>
                          <SelectItem value="driver">Motorista</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.name}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {form.watch("role") === "member" ? "Para Membros Kovi, a empresa deve ser Kovi." : ""}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Usuário</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Confirme se deseja redefinir a senha deste usuário. Uma nova senha será gerada e enviada por email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="default" onClick={confirmResetPassword}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Confirmar Redefinição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
