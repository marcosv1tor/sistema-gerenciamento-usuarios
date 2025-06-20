import React from 'react';
import { TableColumn } from '@/types';
import { cn } from '@/utils/cn';
import Button from './Button';

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const LoadingSkeleton: React.FC<{ columns: number }> = ({ columns }) => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: columns }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export function Table<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado',
  className,
  onRowClick,
}: TableProps<T>) {
  const isClickable = !!onRowClick;

  return (
    <div className={cn('overflow-hidden border border-gray-200 rounded-lg', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={column.key as string || index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                  align={column.align}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton columns={columns.length} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-8 text-center text-gray-500"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick?.(item)}
                  isClickable={isClickable}
                  className={isClickable ? 'hover:bg-gray-50 cursor-pointer' : ''}
                >
                  {columns.map((column, cellIndex) => (
                    <TableCell
                      key={column.key as string || cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      align={column.align}
                    >
                      {column.render
                        ? column.render(item, rowIndex)
                        : String(item[column.key as keyof T] || '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <thead className={cn('bg-gray-50', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className,
}) => {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  onClick,
  isClickable,
}) => {
  return (
    <tr
      className={cn(
        isClickable && 'hover:bg-gray-50 cursor-pointer transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps & React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className,
  align = 'left',
  ...props
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={cn(alignClasses[align], className)}
      {...props}
    >
      {children}
    </td>
  );
};

export default Table;