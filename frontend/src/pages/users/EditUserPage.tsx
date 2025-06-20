import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { UpdateUserData, UserRole } from '@/types';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

const editUserSchema = z.object({
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
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: 'Senha deve ter pelo menos 6 caracteres',
    }),
  confirmPassword: z
    .string()
    .optional(),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Papel é obrigatório' }),
  }),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type EditUserFormData = z.infer<typeof editUserSchema>;

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useUser(id!);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
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

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, reset]);

  // Check permissions
  const canEditAdmin = currentUser?.role === UserRole.ADMIN;
  const canEditManager = currentUser?.role === UserRole.ADMIN;
  const canEditUser = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;
  const canEditSelf = currentUser?.id === user?.id;
  
  // Can edit if has permission for the role or is editing self (with restrictions)
  const canEdit = canEditSelf || 
    (user?.role === UserRole.ADMIN && canEditAdmin) ||
    (user?.role === UserRole.MANAGER && canEditManager) ||
    (user?.role === UserRole.USER && canEditUser);

  const canChangeRole = !canEditSelf && (
    (user?.role === UserRole.ADMIN && canEditAdmin) ||
    (user?.role === UserRole.MANAGER && canEditManager) ||
    (user?.role === UserRole.USER && canEditUser)
  );

  const canChangeStatus = !canEditSelf && canEdit;

  const onSubmit = async (data: EditUserFormData) => {
    try {
      setError('');
      setSuccess('');
      setIsSubmitting(true);
      
      if (!canEdit) {
        setError('Você não tem permissão para editar este usuário');
        return;
      }
      
      // Check role change permissions
      if (data.role !== user?.role && !canChangeRole) {
        setError('Você não tem permissão para alterar o papel deste usuário');
        return;
      }
      
      // Check if trying to change role to admin/manager without permission
      if (data.role === UserRole.ADMIN && !canEditAdmin) {
        setError('Você não tem permissão para definir usuários como administradores');
        return;
      }
      
      if (data.role === UserRole.MANAGER && !canEditManager) {
        setError('Você não tem permissão para definir usuários como gerentes');
        return;
      }
      
      const updateData: UpdateUserData = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };
      
      // Only include password if provided
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }
      
      await updateUserMutation.mutateAsync({ id: id!, data: updateData });
      setSuccess('Usuário atualizado com sucesso!');
      
      // Clear password fields
      reset({
        ...data,
        password: '',
        confirmPassword: '',
      });
      
      setShowPasswordFields(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar usuário');
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

  const getRoleBadgeType = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger';
      case UserRole.MANAGER:
        return 'warning';
      default:
        return 'primary';
    }
  };

  if (isLoadingUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert type="danger">
          {userError?.message || 'Usuário não encontrado'}
        </Alert>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert type="danger">
          Você não tem permissão para editar este usuário.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Usuário</h1>
          <p className="text-gray-600">Modifique as informações do usuário</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Informações Atuais</h3>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {user.name}
              </h4>
              
              <p className="text-gray-600 mb-3">
                {user.email}
              </p>
              
              <Badge type={getRoleBadgeType(user.role)} className="mb-4">
                {getRoleLabel(user.role)}
              </Badge>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Criado em:</span>
                  <span>
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge type={user.isActive ? 'success' : 'warning'} size="sm">
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Último acesso:</span>
                  <span>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                  </span>
                </div>
                
                {canEditSelf && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600">
                      💡 Você está editando seu próprio perfil. Algumas opções podem estar limitadas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Editar Informações</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert type="danger" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert type="success" onClose={() => setSuccess('')}>
                  {success}
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

              {/* Password Change */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="text-md font-medium text-gray-900">
                    Alterar Senha
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    {showPasswordFields ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                
                {showPasswordFields && (
                  <div className="space-y-4">
                    <Alert type="info">
                      Deixe em branco para manter a senha atual.
                    </Alert>
                    
                    <div>
                      <Input
                        {...register('password')}
                        type="password"
                        label="Nova senha"
                        placeholder="Digite a nova senha (opcional)"
                        error={errors.password?.message}
                        leftIcon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        }
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
                      label="Confirmar nova senha"
                      placeholder="Confirme a nova senha"
                      error={errors.confirmPassword?.message}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Role and Status */}
              {(canChangeRole || canChangeStatus) && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Permissões e Status
                  </h4>
                  
                  {canChangeRole && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Papel do usuário *
                      </label>
                      <div className="space-y-3">
                        {Object.values(UserRole).map((role) => {
                          const isDisabled = 
                            (role === UserRole.ADMIN && !canEditAdmin) ||
                            (role === UserRole.MANAGER && !canEditManager);
                          
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
                  )}
                  
                  {canChangeStatus && (
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
                  )}
                </div>
              )}

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
                  disabled={!isDirty}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EditUserPage;