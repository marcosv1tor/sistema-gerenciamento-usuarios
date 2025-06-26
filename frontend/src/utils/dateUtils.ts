import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatTimeAgo = (dateString: string): string => {
  // Garantir que a data seja interpretada corretamente
  const date = new Date(dateString);
  
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
};