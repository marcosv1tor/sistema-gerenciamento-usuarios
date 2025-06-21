import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { User, UserRole, TableColumn } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const pageSize = 10;
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm || undefined,
    role: roleFilter || undefined,
  }), [currentPage, debouncedSearchTerm, roleFilter]);
  
  const { data: usersData, isLoading, error } = useUsers(queryParams);
  const deleteUserMutation = useDeleteUser();
  
  const hasAdminAccess = currentUser?.role === UserRole.ADMIN;
  const hasManagerAccess = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;
  
  if (!hasManagerAccess) {
    return (
      <div className="text-center py-12">
        <Alert type="danger">
          Você não tem permissão para acessar esta página.
        </Alert>
      </div>
    );
  }
  
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
        return 'Admin';
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
  
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };
  
  const canDeleteUser = (user: User) => {
    if (!hasAdminAccess && user.role === UserRole.ADMIN) return false;
    if (user.id === currentUser?.id) return false;
    return true;
  };
  
  const canEditUser = (user: User) => {
    if (!hasAdminAccess && user.role === UserRole.ADMIN) return false;
    return true;
  };
  
  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      label: 'Nome',
      header: 'Nome',
      render: (user) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Função',
      header: 'Função',
      render: (user) => (
        <Badge type={getRoleBadgeType(user.role)}>
          {getRoleLabel(user.role)}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      header: 'Status',
      render: (user) => (
        <Badge type={user.isActive ? 'success' : 'warning'}>
          {user.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      header: 'Criado em',
      render: (user) => (
        <span className="text-sm text-gray-900">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      header: 'Ações',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/users/${user.id}`)}
            className="p-1"
            aria-label="Ver detalhes"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Button>
          
          {canEditUser(user) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/users/${user.id}/edit`)}
              className="p-1"
              aria-label="Editar usuário"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
          )}
          
          {canDeleteUser(user) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(user)}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label="Excluir usuário"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleRoleFilter = (role: UserRole | '') => {
    setRoleFilter(role);
    setCurrentPage(1);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/users/create')}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Novo Usuário
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value as UserRole | '')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as funções</option>
              <option value={UserRole.ADMIN}>Administrador</option>
              <option value={UserRole.MANAGER}>Gerente</option>
              <option value={UserRole.USER}>Usuário</option>
            </select>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setCurrentPage(1);
                }}
                className="flex-1"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Error State */}
      {error && (
        <Alert type="danger">
          Erro ao carregar usuários. Tente novamente.
        </Alert>
      )}
      
      {/* Users Table */}
      <Card>
        <CardBody padding="none">
          <Table
            data={usersData?.data || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Nenhum usuário encontrado"
          />
        </CardBody>
      </Card>
      
      {/* Pagination */}
      {usersData?.meta?.totalPages && usersData.meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={usersData.meta.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja excluir o usuário{' '}
            <strong>{userToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={deleteUserMutation.isPending}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
