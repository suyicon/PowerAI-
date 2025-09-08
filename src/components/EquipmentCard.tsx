import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { toast } from 'sonner';



interface EquipmentCardProps {
  id: string;
  name: string;
  type: string;
  location: string;
  substationId: string;
  substationName: string;
  status: 'normal' | 'warning' | 'error';
  temperature?: number;
  lastMaintenance?: string;
  imageUrl?: string;
}

export default function EquipmentCard({
  id,
  name,
  type,
  location,
  substationId,
  substationName,
  status,
  temperature = 0,
  lastMaintenance = 'N/A',
  imageUrl
}: EquipmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine status color and icon
  const getStatusInfo = () => {
    switch (status) {
      case 'normal':
        return { color: 'bg-green-100 text-green-800', icon: 'fa-check-circle' };
      case 'warning':
        return { color: 'bg-yellow-100 text-yellow-800', icon: 'fa-exclamation-triangle' };
      case 'error':
        return { color: 'bg-red-100 text-red-800', icon: 'fa-exclamation-circle' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: 'fa-question-circle' };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Handle quick action
  const navigate = useNavigate();
  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    switch (action) {
      case 'maintenance':
        toast.info(`正在为 ${name} 创建维护记录`);
        break;
      case 'inspect':
        navigate(`/equipment/${id}`);
        break;
      case 'alerts':
        // 导航到设备详情页并自动切换到告警历史标签
        navigate(`/equipment/${id}?tab=alerts`);
        break;
    }
  };

  return (
    <Link 
      to={`/equipment/${id}`}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col">
        {/* Equipment image */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <i className="fa-solid fa-microchip text-5xl text-gray-300"></i>
            </div>
          )}
          
          {/* Quick actions */}
          <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-3 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <button 
              onClick={(e) => handleQuickAction('inspect', e)}
              className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 transition duration-150"
              title="快速检查"
            >
              <i className="fa-solid fa-search"></i>
            </button>
            <button 
              onClick={(e) => handleQuickAction('maintenance', e)}
              className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 transition duration-150"
              title="维护记录"
            >
              <i className="fa-solid fa-tools"></i>
            </button>
            <button 
              onClick={(e) => handleQuickAction('alerts', e)}
              className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 transition duration-150"
              title="查看告警"
            >
              <i className="fa-solid fa-bell"></i>
            </button>
          </div>
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={status} />
          </div>
        </div>
        
        {/* Equipment info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 truncate">{name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{type}</span>
          </div>
          
            <div className="text-sm text-gray-500 mb-4">
               <p className="flex items-center mb-1">
                <i className="fa-solid fa-building mr-1.5"></i>
                变电站: {substationName}
              </p>
              <p className="flex items-center">
                <i className="fa-solid fa-map-marker-alt mr-1.5"></i>
                {location}
              </p>
            </div>
          
          {/* Temperature gauge */}
          {temperature > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">温度</span>
                <span className="font-medium">{temperature}°C</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    temperature > 75 ? 'bg-red-500' : temperature > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (temperature / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>ID: {id}</span>
            <span>上次维护: {lastMaintenance}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}