
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: '',
  });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações de perfil foram atualizadas com sucesso.",
    });
    setEditing(false);
  };

  if (!user) {
    return <div>Carregando informações do usuário...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
      
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Gerencie suas informações básicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {profileImage ? (
                  <AvatarImage src={profileImage} />
                ) : (
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              {editing && (
                <div className="absolute -right-2 -bottom-2">
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center">
                      <Camera className="h-4 w-4" />
                    </div>
                  </Label>
                  <Input 
                    id="profileImage" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!editing}
                  placeholder={editing ? "Informe seu telefone" : "Não informado"}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Detalhes sobre sua conta e acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Função</p>
              <p>{user.role === 'admin' ? 'Administrador' : 
                  user.role === 'member' ? 'Membro Kovi' : 
                  user.role === 'partner' ? 'Parceiro' : 'Motorista'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Empresa</p>
              <p>{user.company}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status da Conta</p>
              <p className="flex items-center">
                <span className={`h-2 w-2 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {user.isActive ? 'Ativa' : 'Inativa'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
              <p>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline">Alterar Senha</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
