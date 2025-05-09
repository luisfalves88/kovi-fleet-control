
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Building } from 'lucide-react';

// Mock data for partners
const mockPartners = [
  {
    id: '1',
    name: 'Recolha Express',
    cnpj: '12.345.678/0001-90',
    address: 'Av. Paulista, 1000, São Paulo, SP',
    responsibleName: 'Roberto Santos',
    responsiblePhone: '(11) 98765-4321',
    responsibleEmail: 'roberto@recolhaexpress.com',
    isActive: true,
    createdAt: new Date(2023, 1, 10)
  },
  {
    id: '2',
    name: 'Transportes Seguro',
    cnpj: '23.456.789/0001-01',
    address: 'Rua Augusta, 500, São Paulo, SP',
    responsibleName: 'Ana Maria Oliveira',
    responsiblePhone: '(11) 97654-3210',
    responsibleEmail: 'ana@transporteseguro.com',
    isActive: true,
    createdAt: new Date(2023, 3, 15)
  },
  {
    id: '3',
    name: 'GuinchoFácil',
    cnpj: '34.567.890/0001-12',
    address: 'Av. Rio Branco, 100, Rio de Janeiro, RJ',
    responsibleName: 'Carlos Eduardo',
    responsiblePhone: '(21) 96543-2109',
    responsibleEmail: 'carlos@guinchofacil.com',
    isActive: false,
    createdAt: new Date(2023, 5, 20)
  }
];

const Partners = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new partner
  const [newPartner, setNewPartner] = useState({
    name: '',
    cnpj: '',
    address: '',
    responsibleName: '',
    responsiblePhone: '',
    responsibleEmail: '',
  });

  // Filter partners based on search
  const filteredPartners = mockPartners.filter(partner => 
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.cnpj.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.responsibleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPartner(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would submit the form data to an API
    console.log("Creating new partner:", newPartner);
    setIsCreateDialogOpen(false);
    // Reset form
    setNewPartner({
      name: '',
      cnpj: '',
      address: '',
      responsibleName: '',
      responsiblePhone: '',
      responsibleEmail: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parceiros</h2>
          <p className="text-muted-foreground">
            Gerencie as empresas parceiras
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-kovi-red hover:bg-kovi-red/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Parceiro</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova empresa parceira.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nome da empresa"
                    value={newPartner.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    value={newPartner.cnpj}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço da Matriz</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Endereço completo"
                    value={newPartner.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Nome do Responsável</Label>
                  <Input
                    id="responsibleName"
                    name="responsibleName"
                    placeholder="Nome completo do responsável"
                    value={newPartner.responsibleName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsiblePhone">Telefone do Responsável</Label>
                  <Input
                    id="responsiblePhone"
                    name="responsiblePhone"
                    placeholder="(DDD) X XXXX-XXXX"
                    value={newPartner.responsiblePhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsibleEmail">E-mail do Responsável</Label>
                  <Input
                    id="responsibleEmail"
                    name="responsibleEmail"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newPartner.responsibleEmail}
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
            placeholder="Buscar por nome, CNPJ ou responsável..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Partners table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPartners.length > 0 ? (
              filteredPartners.map(partner => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{partner.cnpj}</TableCell>
                  <TableCell>{partner.address}</TableCell>
                  <TableCell>{partner.responsibleName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{partner.responsiblePhone}</p>
                      <p className="text-muted-foreground">{partner.responsibleEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={partner.isActive ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}
                    >
                      {partner.isActive ? 'Ativo' : 'Inativo'}
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
                        className={partner.isActive ? "text-red-500" : "text-green-500"}
                      >
                        {partner.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Building className="h-12 w-12 mb-2" />
                    <p>Nenhum parceiro encontrado</p>
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

export default Partners;
