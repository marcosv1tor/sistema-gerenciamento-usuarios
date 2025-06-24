import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, googleLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(''); // Limpar erro anterior
    
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      // Capturar diferentes tipos de erro e exibir mensagens específicas
      let errorMessage = 'Erro ao fazer login';
      
      if (err.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // O isLoading será resetado automaticamente pelo AuthContext
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      // Definir mensagem de erro apropriada
      let errorMessage = 'Erro ao fazer login com Google. Tente novamente.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Credenciais do Google inválidas ou expiradas.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Dados do Google inválidos.';
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Exibir erro no formulário
      setError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    console.error('Erro no login com Google');
    toast.error('Erro ao fazer login com Google');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* Logo Conéctar */}
          <div className="flex justify-center mb-6">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-48 h-auto"
    viewBox="0 0 400 100"
    fill="none"
  >
    <text
      x="50%"
      y="60"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
      fontSize="48"
      fill="#1BC47D"
    >
      Conectar
    </text>
    <path
      d="M202 22c4-6 10-10 16-10-1 6-5 13-10 16-4 2-8 1-6-6Z"
      fill="#1BC47D"
    />

    <path
      d="M100 75c80 20 120 20 200 0"
      stroke="#1BC47D"
      strokeWidth="5"
      fill="none"
    />
  </svg>
</div>


          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Faça login em sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>

        {/* Form */}
        <Card className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert type="danger" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <div className="space-y-4">
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
                required
              />

              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Senha"
                placeholder="Sua senha"
                error={errors.password?.message}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
              isLoading={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>

            {/* Botão Google */}
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          </form>
        </Card>

        {/* Demo credentials */}
        <Card className="mt-4 bg-primary-50 border-primary-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-primary-900 mb-2">
              Credenciais de Demonstração
            </h3>
            <div className="text-xs text-primary-700 space-y-1">
              <p><strong>Admin:</strong> admin@example.com / password123</p>
              <p><strong>Gerente:</strong> manager@example.com / password123</p>
              <p><strong>Usuário:</strong> user@example.com / password123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
