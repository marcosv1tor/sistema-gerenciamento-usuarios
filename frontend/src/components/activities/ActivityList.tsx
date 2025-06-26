import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActivities } from '@/hooks/useActivities';
import { UserRole, ActivityType } from '@/types';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatTimeAgo } from '@/utils/dateUtils';

const ActivityList: React.FC = () => {
  const { user } = useAuth();
  const { data: activitiesData, isLoading, error } = useActivities({ limit: 10 });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.LOGIN:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case ActivityType.LOGOUT:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      case ActivityType.USER_CREATED:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case ActivityType.USER_UPDATED:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case ActivityType.USER_DELETED:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case ActivityType.PROFILE_UPDATED:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActivityBadgeType = (type: ActivityType) => {
    switch (type) {
      case ActivityType.LOGIN:
        return 'success';
      case ActivityType.LOGOUT:
        return 'warning';
      case ActivityType.USER_CREATED:
        return 'info';
      case ActivityType.USER_UPDATED:
        return 'primary';
      case ActivityType.USER_DELETED:
        return 'danger';
      case ActivityType.PROFILE_UPDATED:
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getActivityTypeLabel = (type: ActivityType) => {
    switch (type) {
      case ActivityType.LOGIN:
        return 'Login';
      case ActivityType.LOGOUT:
        return 'Logout';
      case ActivityType.USER_CREATED:
        return 'Usuário Criado';
      case ActivityType.USER_UPDATED:
        return 'Usuário Atualizado';
      case ActivityType.USER_DELETED:
        return 'Usuário Deletado';
      case ActivityType.PROFILE_UPDATED:
        return 'Perfil Atualizado';
      default:
        return 'Atividade';
    }
  };

  if (user?.role === UserRole.USER) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p>Seu perfil não possui permissão para visualizar as atividades</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Erro ao carregar atividades</p>
      </div>
    );
  }

  if (!activitiesData?.data?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>Nenhuma atividade recente para exibir</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activitiesData.data.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className={`p-2 rounded-full ${
            getActivityBadgeType(activity.type) === 'success' ? 'bg-green-100 text-green-600' :
            getActivityBadgeType(activity.type) === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            getActivityBadgeType(activity.type) === 'danger' ? 'bg-red-100 text-red-600' :
            getActivityBadgeType(activity.type) === 'info' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.description}
              </p>
              <Badge type={getActivityBadgeType(activity.type)} size="sm">
                {getActivityTypeLabel(activity.type)}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {activity.user.name}
                {activity.targetUser && (
                  <span> → {activity.targetUser.name}</span>
                )}
              </p>
              <p className="text-xs text-gray-400">
                {formatTimeAgo(activity.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;