
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast.success('Um e-mail de recuperação foi enviado para o seu endereço');
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error('Falha ao enviar o e-mail de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Recuperação de Senha</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Digite seu e-mail para receber instruções de recuperação
          </p>
        </div>
        <Card className="mt-6">
          {!isSubmitted ? (
            <>
              <CardHeader>
                <CardTitle>Recuperar senha</CardTitle>
                <CardDescription>
                  Enviaremos um e-mail com instruções para redefinir sua senha
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleResetPassword}>
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
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-kovi-red hover:bg-kovi-red/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar instruções'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Voltar para login
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>E-mail enviado</CardTitle>
                <CardDescription>
                  Verifique sua caixa de entrada para instruções
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <p>
                  Enviamos um e-mail para <strong>{email}</strong> com instruções para recuperar sua senha.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Voltar para login
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Lembrou sua senha?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
