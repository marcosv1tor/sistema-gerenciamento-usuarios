import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/hooks/useUsers';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const {
    data: user,
    isLoading,
    error,
  } = useUser(id!);

  const hasManagerAccess = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;
  const canEdit = hasManagerAccess || currentUser?.id === user?.id;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert type="danger">
          Erro ao carregar dados do usuário. Tente novamente.
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Voltar para Usuários
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Alert type="warning">
          Usuário não encontrado.
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Voltar para Usuários
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Usuário</h1>
          <p className="text-gray-600">Informações detalhadas do usuário</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Voltar
          </Button>
          {canEdit && (
            <Button
              variant="primary"
              onClick={() => navigate(`/users/${user.id}/edit`)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge type={getRoleBadgeType(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge type={user.isActive ? 'success' : 'warning'}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Informações Pessoais
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-900">Nome Completo</dt>
                  <dd className="text-sm text-gray-600">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-900">Email</dt>
                  <dd className="text-sm text-gray-600">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-900">Função</dt>
                  <dd className="text-sm text-gray-600">{getRoleLabel(user.role)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-900">Status</dt>
                  <dd className="text-sm text-gray-600">
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Informações do Sistema
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-900">Data de Criação</dt>
                  <dd className="text-sm text-gray-600">{formatDate(user.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-900">Última Atualização</dt>
                  <dd className="text-sm text-gray-600">{formatDate(user.updatedAt)}</dd>
                </div>
                {user.lastLoginAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Último Login</dt>
                    <dd className="text-sm text-gray-600">{formatDate(user.lastLoginAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UserDetailPage;