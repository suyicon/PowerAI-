import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'normal' | 'warning' | 'error' | 'pending' | 'completed';
  count?: number;
  className?: string;
}

export default function StatusBadge({
  status,
  count,
  className = ''
}: StatusBadgeProps) {
  // Determine badge styles based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'normal':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: 'fa-check-circle'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: 'fa-exclamation-triangle'
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: 'fa-exclamation-circle'
        };
      case 'pending':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: 'fa-clock'
        };
      case 'completed':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: 'fa-check'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: 'fa-question-circle'
        };
    }
  };

  const { bgColor, textColor, icon } = getStatusStyles();
  
  // Get display text for status
  const getStatusText = () => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'warning':
        return '注意';
      case 'error':
        return '异常';
      case 'pending':
        return '待处理';
      case 'completed':
        return '已完成';
      default:
        return '未知';
    }
  };

  return (
    <span className={cn(
      `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`,
      bgColor,
      textColor,
      className
    )}>
      {count ? (
        <>
          <span className="flex items-center">
            <i className={`fa-solid ${icon} mr-1.5`}></i>
            {getStatusText()}
          </span>
          <span className="ml-1.5 px-1.5 py-0.5 bg-white bg-opacity-30 rounded-full text-[10px] font-bold">
            {count}
          </span>
        </>
      ) : (
        <span className="flex items-center">
          <i className={`fa-solid ${icon} mr-1.5`}></i>
          {getStatusText()}
        </span>
      )}
    </span>
  );
}