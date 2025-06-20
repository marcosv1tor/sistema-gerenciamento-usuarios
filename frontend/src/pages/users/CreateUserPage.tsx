import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateUser } from '@/hooks/useUsers';
import { CreateUserData, UserRole } from '@/types';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Papel é obrigatório' }),
  }),
  isActive: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createUser = useCreateUser();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.USER,
      isActive: true,
    },
  });

  const password = watch('password');
  const selectedRole = watch('role');
  const isActive = watch('isActive');

  // Check permissions
  const canCreateAdmin = user?.role === UserRole.ADMIN;
  const canCreateManager = user?.role === UserRole.ADMIN;
  const canCreateUser = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setError('');
      setIsSubmitting(true);
      
      // Check permissions before submitting
      if (data.role === UserRole.ADMIN && !canCreateAdmin) {
        setError('Você não tem permissão para criar administradores');
        return;
      }
      
      if (data.role === UserRole.MANAGER && !canCreateManager) {
        setError('Você não tem permissão para criar gerentes');
        return;
      }
      
      if (!canCreateUser) {
        setError('Você não tem permissão para criar usuários');
        return;
      }
      
      const createData: CreateUserData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        isActive: data.isActive,
      };
      
      await createUser.mutateAsync(createData);
      navigate('/users', { 
        state: { 
          message: `Usuário ${data.name} criado com sucesso!`,
          type: 'success'
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 4) return { strength, label: 'Média', color: 'bg-yellow-500' };
    return { strength, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.MANAGER:
        return 'Gerente';
      default:
        return 'Usuário';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Acesso total ao sistema, pode gerenciar todos os usuários e configurações';
      case UserRole.MANAGER:
        return 'Pode gerenciar usuários comuns e visualizar relatórios';
      default:
        return 'Acesso básico ao sistema';
    }
  };

  // Check if user has permission to access this page
  if (!canCreateUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert type="danger">
          Você não tem permissão para criar usuários.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Novo Usuário</h1>
          <p className="text-gray-600">Adicione um novo usuário ao sistema</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        >
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Informações do Usuário</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert type="danger" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                Informações Básicas
              </h4>
              
              <Input
                {...register('name')}
                label="Nome completo"
                placeholder="Nome completo do usuário"
                error={errors.name?.message}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                required
              />
              
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="email@exemplo.com"
                error={errors.email?.message}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                Senha
              </h4>
              
              <div>
                <Input
                  {...register('password')}
                  type="password"
                  label="Senha"
                  placeholder="Digite a senha"
                  error={errors.password?.message}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  required
                />
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <Input
                {...register('confirmPassword')}
                type="password"
                label="Confirmar senha"
                placeholder="Confirme a senha"
                error={errors.confirmPassword?.message}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                required
              />
            </div>

            {/* Role and Status */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                Permissões e Status
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Papel do usuário *
                </label>
                <div className="space-y-3">
                  {Object.values(UserRole).map((role) => {
                    const isDisabled = 
                      (role === UserRole.ADMIN && !canCreateAdmin) ||
                      (role === UserRole.MANAGER && !canCreateManager);
                    
                    return (
                      <label
                        key={role}
                        className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRole === role
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          {...register('role')}
                          type="radio"
                          value={role}
                          disabled={isDisabled}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {getRoleLabel(role)}
                            {isDisabled && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Sem permissão)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {getRoleDescription(role)}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    {...register('isActive')}
                    type="checkbox"
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Usuário ativo</div>
                    <div className="text-sm text-gray-600">
                      {isActive 
                        ? 'O usuário poderá fazer login no sistema'
                        : 'O usuário não poderá fazer login no sistema'
                      }
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/users')}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                {isSubmitting ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateUserPage;