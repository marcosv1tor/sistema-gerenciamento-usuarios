import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateUserData, UserRole } from '@/types';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  currentPassword: z
    .string()
    .optional(),
  newPassword: z
    .string()
    .optional(),
  confirmPassword: z
    .string()
    .optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  if (data.newPassword && data.newPassword.length < 6) {
    return false;
  }
  return true;
}, {
  message: 'Dados de senha inválidos',
  path: ['newPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const currentPassword = watch('currentPassword');

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError('');
      setSuccess('');
      
      const updateData: UpdateUserData = {
        name: data.name,
        email: data.email,
      };
      
      // Only include password fields if user wants to change password
      if (data.newPassword && data.currentPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.password = data.newPassword;
      }
      
      await updateProfile(updateData);
      setSuccess('Perfil atualizado com sucesso!');
      
      // Clear password fields
      reset({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
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

  const passwordStrength = getPasswordStrength(newPassword || '');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e configurações de conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Informações da Conta</h3>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#a2f9bf'}}>
                <span className="text-gray-700 text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {user?.name}
              </h4>
              
              <p className="text-gray-600 mb-3">
                {user?.email}
              </p>
              
              <Badge type={getRoleBadgeType(user?.role!)} className="mb-4">
                {getRoleLabel(user?.role!)}
              </Badge>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Membro desde:</span>
                  <span>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge type={user?.isActive ? 'success' : 'warning'} size="sm">
                    {user?.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Último acesso:</span>
                  <span>
                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Editar Perfil</h3>
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
                  placeholder="Seu nome completo"
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
                  placeholder="seu@email.com"
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
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                
                {showPasswords && (
                  <div className="space-y-4">
                    <Input
                      {...register('currentPassword')}
                      type="password"
                      label="Senha atual"
                      placeholder="Digite sua senha atual"
                      error={errors.currentPassword?.message}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      }
                    />
                    
                    <div>
                      <Input
                        {...register('newPassword')}
                        type="password"
                        label="Nova senha"
                        placeholder="Digite sua nova senha"
                        error={errors.newPassword?.message}
                        leftIcon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        }
                      />
                      
                      {/* Password strength indicator */}
                      {newPassword && (
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
                      placeholder="Confirme sua nova senha"
                      error={errors.confirmPassword?.message}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                    
                    {newPassword && !currentPassword && (
                      <Alert type="warning">
                        Para alterar a senha, você deve informar sua senha atual.
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset({
                      name: user?.name || '',
                      email: user?.email || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setError('');
                    setSuccess('');
                  }}
                >
                  Cancelar
                </Button>
                
                <Button
                  className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={!isDirty}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;