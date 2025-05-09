
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Demo login credentials
  const demoAccounts = [
    { email: 'admin@kovi.com.br', role: 'Administrador' },
    { email: 'member@kovi.com.br', role: 'Membro Kovi' },
    { email: 'partner@example.com', role: 'Parceiro' },
    { email: 'driver@example.com', role: 'Chofer' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Falha no login: verifique suas credenciais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Login com Google realizado com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error('Falha no login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    try {
      await login(demoEmail, '123456');
      toast.success('Login de demonstração realizado com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Demo login failed:', error);
      toast.error('Falha no login de demonstração');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted p-4">
      <div className="grid w-full max-w-[1000px] gap-6 md:grid-cols-2">
        {/* Left panel with branding */}
        <div className="hidden md:flex flex-col justify-between rounded-lg bg-kovi-darkgray p-10 text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" fill="#FF3D57" />
                  <path d="M12 10C13.6569 10 15 8.65685 15 7H9C9 8.65685 10.3431 10 12 10Z" fill="white" />
                  <path d="M16 14H8C7.44772 14 7 14.4477 7 15C7 15.5523 7.44772 16 8 16H16C16.5523 16 17 15.5523 17 15C17 14.4477 16.5523 14 16 14Z" fill="white" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Kovi Fleet Control</h1>
            </div>
            <p className="text-gray-400">Plataforma de gestão de recolhas de veículos</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sistema de gestão de recolha de veículos</h2>
            <p className="text-sm text-gray-400">
              Realize o gerenciamento completo do processo de recolha de veículos por inadimplência.
              Acompanhe status, SLAs e mantenha comunicação entre todos os envolvidos.
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <p className="text-sm font-semibold">Para fins de demonstração, use:</p>
              <div className="grid grid-cols-1 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.email)}
                    className="flex items-center justify-between p-2 text-sm bg-white/10 rounded hover:bg-white/20 transition-colors"
                  >
                    <span>{account.email}</span>
                    <span className="text-xs bg-kovi-red px-2 py-1 rounded">
                      {account.role}
                    </span>
                  </button>
                ))}
                <p className="text-xs text-center mt-2">Senha: 123456</p>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Kovi
          </div>
        </div>
        
        {/* Right panel with login form */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Entrar</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Acesso</CardTitle>
              <CardDescription>
                Digite seu e-mail e senha ou use o acesso via Google
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      to="/reset-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-kovi-red hover:bg-kovi-red/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Aguarde...' : 'Entrar'}
                </Button>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                  Google
                </Button>
              </CardFooter>
            </form>
          </Card>
          <div className="md:hidden text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Kovi
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
