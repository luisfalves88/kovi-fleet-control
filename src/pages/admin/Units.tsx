
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin } from 'lucide-react';

// Mock data for units
const mockUnits = [
  {
    id: '1',
    name: 'Pátio São Paulo - Zona Sul',
    address: 'Av. Interlagos, 2000, São Paulo, SP',
    isActive: true,
    createdAt: new Date(2023, 1, 10)
  },
  {
    id: '2',
    name: 'Pátio São Paulo - Zona Oeste',
    address: 'Rua Butantã, 500, São Paulo, SP',
    isActive: true,
    createdAt: new Date(2023, 3, 15)
  },
  {
    id: '3',
    name: 'Pátio Rio de Janeiro - Centro',
    address: 'Av. Rio Branco, 100, Rio de Janeiro, RJ',
    isActive: false,
    createdAt: new Date(2023, 5, 20)
  },
  {
    id: '4',
    name: 'Pátio Belo Horizonte',
    address: 'Av. Amazonas, 1200, Belo Horizonte, MG',
    isActive: true,
    createdAt: new Date(2023, 7, 5)
  }
];

const Units = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new unit
  const [newUnit, setNewUnit] = useState({
    name: '',
    address: '',
  });

  // Filter units based on search
  const filteredUnits = mockUnits.filter(unit => 
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUnit(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would submit the form data to an API
    console.log("Creating new unit:", newUnit);
    setIsCreateDialogOpen(false);
    // Reset form
    setNewUnit({
      name: '',
      address: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Unidades</h2>
          <p className="text-muted-foreground">
            Gerencie os pátios onde os veículos podem ser entregues
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-kovi-red hover:bg-kovi-red/90">
              <Plus className="mr-2 h-4 w-4" /> Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Unidade</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar um novo pátio de entrega.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Unidade</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nome da unidade"
                    value={newUnit.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Endereço completo"
                    value={newUnit.address}
                    onChange={handleInputChange}
                    required
                  />
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
            placeholder="Buscar por nome ou endereço..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Units table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nome da Unidade</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length > 0 ? (
              filteredUnits.map(unit => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.address}</TableCell>
                  <TableCell>{unit.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={unit.isActive ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}
                    >
                      {unit.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={unit.isActive ? "text-red-500" : "text-green-500"}
                      >
                        {unit.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mb-2" />
                    <p>Nenhuma unidade encontrada</p>
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

export default Units;
