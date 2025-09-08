import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import EquipmentCard from '@/components/EquipmentCard';
import StatusBadge from '@/components/StatusBadge';
import { Empty } from '@/components/Empty';
import { toast } from 'sonner';
import { db, Substation, Equipment } from '@/lib/db';

// Equipment types for filter
const equipmentTypes = [
  { id: 'all', name: '所有类型' },
  { id: '变压器', name: '变压器' },
  { id: '断路器', name: '断路器' },
  { id: '隔离开关', name: '隔离开关' },
  { id: '互感器', name: '互感器' },
  { id: '避雷器', name: '避雷器' }
];

export default function EquipmentList() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSubstation, setSelectedSubstation] = useState('all');
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);

  // Load data from database
  const loadData = useCallback(() => {
    try {
      setLoading(true);
      setLoadError(null);
      
      // Get data from database
      const substationsData = db.getSubstations();
      const equipmentData = db.getEquipment();
      
      // Verify data
      if (!substationsData || substationsData.length === 0) {
        console.warn('No substations data found');
        setLoadError('未找到变电站数据，请检查数据库连接');
      }
      
      if (!equipmentData || equipmentData.length === 0) {
        console.warn('No equipment data found');
      }
      
      // Update state
      setSubstations(substationsData);
      setEquipmentData(equipmentData);
      setFilteredEquipment(equipmentData);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoadError('加载数据时发生错误: ' + (error as Error).message);
      toast.error('加载数据失败，请刷新页面重试');
      setLoading(false);
    }
  }, []);
  
  // Initial data load and data change subscription
  useEffect(() => {
    loadData();
    
    // Subscribe to data changes
    const handleDataChange = () => {
      loadData();
    };
    
    db.subscribe(handleDataChange);
    
    return () => {
      db.unsubscribe(handleDataChange);
    };
  }, [loadData]);

  // Filter equipment based on search, type and status
  useEffect(() => {
    let result = [...equipmentData];
    
    // Substation filter
    if (selectedSubstation !== 'all') {
      result = result.filter(item => item.substationId === selectedSubstation);
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.id.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    }
    
    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType);
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(item => item.status === selectedStatus);
    }
    
    setFilteredEquipment(result);
  }, [equipmentData, searchTerm, selectedType, selectedStatus, selectedSubstation]);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('设备列表已更新');
    }, 800);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedSubstation('all');
  };

  // Generate status summary
  const getStatusSummary = () => {
    const summary = {
      normal: equipmentData.filter(item => item.status === 'normal').length,
      warning: equipmentData.filter(item => item.status === 'warning').length,
      error: equipmentData.filter(item => item.status === 'error').length
    };
    
    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">变电站</h1>
          <p className="text-gray-500 mt-1">查看和管理所有电力系统设备</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
          >
            <i className="fa-solid fa-sync-alt mr-2"></i>
            刷新
          </button>
          <button 
            onClick={() => toast.info('功能开发中，敬请期待')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-150"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            添加设备
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatusBadge status="normal" count={statusSummary.normal} />
        <StatusBadge status="warning" count={statusSummary.warning} />
        <StatusBadge status="error" count={statusSummary.error} />
        <div className="ml-auto text-sm text-gray-500">
          共 {equipmentData.length} 台设备
        </div>
      </div>

       {/* Substation selection with error handling */}
      {loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <i className="fa-solid fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
            <div>
              <h3 className="text-sm font-medium text-red-800">数据加载错误</h3>
              <p className="text-sm text-red-700 mt-1">{loadError}</p>
              <button 
                onClick={loadData}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                <i className="fa-solid fa-refresh mr-1"></i>重试加载
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">变电站选择</h3>
          
          {substations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-building text-4xl mb-3 opacity-30"></i>
              <p>未找到变电站数据</p>
              <button 
                onClick={loadData}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <i className="fa-solid fa-refresh mr-1"></i>刷新数据
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {substations.map(substation => (
                <div 
                  key={substation.id}
                  onClick={() => setSelectedSubstation(substation.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedSubstation === substation.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{substation.name}</h4>
                    <StatusBadge status={substation.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{substation.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{substation.capacity}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-solid fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="搜索设备名称、ID或位置..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            >
              {equipmentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          {/* Status filter */}
          <div className="flex space-x-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block flex-1 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            >  
              <option value="all">所有状态</option>
              <option value="normal">正常</option>
              <option value="warning">注意</option>
              <option value="error">故障</option>
            </select>
            
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
            >
              <i className="fa-solid fa-filter-circle-xmark"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Equipment grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-100"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => {
            // 获取变电站名称
            const substation = substations.find(s => s.id === equipment.substationId);
            return (
              <EquipmentCard 
                key={equipment.id} 
                {...equipment} 
                substationName={substation ? substation.name : '未知变电站'} 
              />
            );
          })}
        </div>
      ) : (
        <Empty message="没有找到匹配的设备" icon="fa-search" />
      )}</div>
  );
}