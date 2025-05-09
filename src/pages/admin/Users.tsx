
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, User } from 'lucide-react';

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos.silva@kovi.com.br',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    role: 'admin',
    company: 'Kovi',
    isActive: true,
    createdAt: new Date(2023, 1, 15)
  },
  {
    id: '2',
    name: 'Marina Oliveira',
    email: 'marina.oliveira@kovi.com.br',
    cpf: '234.567.890-11',
    phone: '(11) 97654-3210',
    role: 'member',
    company: 'Kovi',
    isActive: true,
    createdAt: new Date(2023, 3, 20)
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao.santos@parceiro.com',
    cpf: '345.678.901-22',
    phone: '(11) 96543-2109',
    role: 'partner',
    company: 'Empresa Parceira',
    isActive: true,
    createdAt: new Date(2023, 5, 10)
  },
  {
    id: '4',
    name: 'Fernando Costa',
    email: 'fernando.costa@parceiro.com',
    cpf: '456.789.012-33',
    phone: '(11) 95432-1098',
    role: 'driver',
    company: 'Empresa Parceira',
    isActive: false,
    createdAt: new Date(2023, 6, 5)
  },
];

const getRoleName = (role: string) => {
  const roles: Record<string, string> = {
    'admin': 'Administrador',
    'member': 'Membro Kovi',
    'partner': 'Parceiro',
    'driver': 'Chofer',
  };
  return roles[role] || role;
};

const Users = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    role: 'member',
    company: 'Kovi',
  });

  // Filter users based on search
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.cpf.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would submit the form data to an API
    console.log("Creating new user:", newUser);
    setIsCreateDialogOpen(false);
    // Reset form
    setNewUser({
      name: '',
      email: '',
      cpf: '',
      phone: '',
      role: 'member',
      company: 'Kovi',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-kovi-red hover:bg-kovi-red/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar um novo usuário ao sistema.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nome completo"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      placeholder="123.456.789-00"
                      value={newUser.cpf}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(DDD) X XXXX-XXXX"
                      value={newUser.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Perfil</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={value => handleSelectChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="member">Membro Kovi</SelectItem>
                      <SelectItem value="partner">Parceiro</SelectItem>
                      <SelectItem value="driver">Chofer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Select
                    value={newUser.company}
                    onValueChange={value => handleSelectChange('company', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kovi">Kovi</SelectItem>
                      <SelectItem value="Empresa Parceira">Empresa Parceira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-kovi-red hover:bg-kovi-red/90">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou CPF..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.cpf}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{getRoleName(user.role)}</TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={user.isActive ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className={user.isActive ? "text-red-500" : "text-green-500"}>
                        {user.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        Reset senha
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <User className="h-12 w-12 mb-2" />
                    <p>Nenhum usuário encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
