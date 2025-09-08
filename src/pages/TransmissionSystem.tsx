import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatusBadge from '@/components/StatusBadge';
import { Empty } from '@/components/Empty';
import { toast } from 'sonner';
import { db } from '@/lib/db';

// 定义输电线路接口
interface TransmissionLine {
  id: string;
  name: string;
  voltageLevel: string;
  length: number;
  startSubstation: string;
  endSubstation: string;
  status: 'normal' | 'warning' | 'error';
  loadRate: number;
  current: number;
  temperature: number;
  lastInspection: string;
  nextInspection: string;
}

// 模拟线路负载数据
const loadData = [
  { name: '00:00', 电流: 450, 负载率: 42 },
  { name: '04:00', 电流: 380, 负载率: 35 },
  { name: '08:00', 电流: 520, 负载率: 48 },
  { name: '12:00', 电流: 680, 负载率: 65 },
  { name: '16:00', 电流: 720, 负载率: 68 },
  { name: '20:00', 电流: 650, 负载率: 62 },
];

// 电压等级过滤器
const voltageLevels = [
  { id: 'all', name: '所有电压' },
  { id: '110kV', name: '110kV' },
  { id: '220kV', name: '220kV' },
  { id: '500kV', name: '500kV' },
  { id: '1000kV', name: '1000kV' }
];

// 线路状态过滤器
const statusOptions = [
  { id: 'all', name: '所有状态' },
  { id: 'normal', name: '正常' },
  { id: 'warning', name: '注意' },
  { id: 'error', name: '故障' }
];

// 输电线路卡片组件
const LineCard = ({ line }: { line: TransmissionLine }) => {
  // 确定状态样式
  const getStatusStyles = () => {
    switch (line.status) {
      case 'normal':
        return { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: 'fa-check-circle' };
      case 'warning':
        return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: 'fa-exclamation-triangle' };
      case 'error':
        return { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: 'fa-exclamation-circle' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: 'fa-question-circle' };
    }
  };
  
  const statusStyles = getStatusStyles();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* 线路信息头部 */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{line.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{line.voltageLevel} · {line.length} km</p>
          </div>
          <StatusBadge status={line.status} />
        </div>
      </div>
      
      {/* 线路详情 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">起点变电站</p>
            <p className="text-sm font-medium text-gray-900">{line.startSubstation}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">终点变电站</p>
            <p className="text-sm font-medium text-gray-900">{line.endSubstation}</p>
          </div>
        </div>
        
        {/* 负载率进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">负载率</span>
            <span className="font-medium">{line.loadRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                line.loadRate > 80 ? 'bg-red-500' : line.loadRate > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${line.loadRate}%` }}
            ></div>
          </div>
        </div>
        
        {/* 关键参数 */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-gray-500">电流</p>
            <p className="font-medium text-gray-900">{line.current} A</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-gray-500">温度</p>
            <p className="font-medium text-gray-900">{line.temperature}°C</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-gray-500">上次巡检</p>
            <p className="font-medium text-gray-900">{line.lastInspection}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TransmissionSystem() {
  // 状态管理
  const [lines, setLines] = useState<TransmissionLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoltage, setSelectedVoltage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filteredLines, setFilteredLines] = useState<TransmissionLine[]>([]);
  
  // 获取输电线路数据
  const fetchLines = useCallback(() => {
    try {
      setLoading(true);
      
      // 从数据库获取变电站数据
      const substations = db.getSubstations().map(s => s.name);
      
      // 生成模拟输电线路数据
      const mockLines: TransmissionLine[] = [
        {
          id: 'TL-001',
          name: '城北-城东线',
          voltageLevel: '220kV',
          length: 18.5,
          startSubstation: substations[0] || '城北变电站',
          endSubstation: substations[2] || '城东变电站',
          status: 'normal',
          loadRate: 58,
          current: 520,
          temperature: 42,
  lastInspection: '2025-07-15',
  nextInspection: '2025-10-15'
        },
        {
          id: 'TL-002',
          name: '城北-城南线',
          voltageLevel: '500kV',
          length: 23.2,
          startSubstation: substations[0] || '城北变电站',
          endSubstation: substations[1] || '城南变电站',
           status: 'normal',
          loadRate: 76,
          current: 680,
          temperature: 58,
  lastInspection: '2025-07-10',
  nextInspection: '2025-10-10'
        },
        {
          id: 'TL-003',
          name: '城东-工业园区线',
          voltageLevel: '110kV',
          length: 12.8,
          startSubstation: substations[2] || '城东变电站',
          endSubstation: '工业园区变电站',
          status: 'normal',
          loadRate: 45,
          current: 390,
          temperature: 38,
  lastInspection: '2025-07-20',
  nextInspection: '2025-10-20'
        },
        {
          id: 'TL-004',
          name: '城南-高新区线',
          voltageLevel: '220kV',
          length: 15.6,
          startSubstation: substations[1] || '城南变电站',
          endSubstation: '高新区变电站',
           status: 'normal',
          loadRate: 92,
          current: 780,
          temperature: 65,
  lastInspection: '2025-07-05',
  nextInspection: '2025-07-25'
        },
        {
          id: 'TL-005',
          name: '城北-开发区线',
          voltageLevel: '110kV',
          length: 9.3,
          startSubstation: substations[0] || '城北变电站',
          endSubstation: '开发区变电站',
          status: 'normal',
          loadRate: 38,
          current: 320,
          temperature: 35,
  lastInspection: '2025-07-18',
  nextInspection: '2025-10-18'
        },
        {
          id: 'TL-006',
          name: '城东-港口线',
          voltageLevel: '220kV',
          length: 27.4,
          startSubstation: substations[2] || '城东变电站',
          endSubstation: '港口变电站',
           status: 'normal',
          loadRate: 72,
          current: 650,
          temperature: 55,
  lastInspection: '2025-07-12',
  nextInspection: '2025-10-12'
        }
      ];
      
      setLines(mockLines);
      setFilteredLines(mockLines);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load transmission lines:', error);
      toast.error('加载输电线路数据失败，请刷新页面重试');
      setLoading(false);
    }
  }, []);
  
  // 初始加载和数据变更订阅
  useEffect(() => {
    fetchLines();
    
    // 订阅数据变更
    const handleDataChange = () => {
      fetchLines();
    };
    
    db.subscribe(handleDataChange);
    
    return () => {
      db.unsubscribe(handleDataChange);
    };
  }, [fetchLines]);
  
  // 筛选线路
  useEffect(() => {
    let result = [...lines];
    
    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(line => 
        line.name.toLowerCase().includes(term) || 
        line.id.toLowerCase().includes(term) ||
        line.startSubstation.toLowerCase().includes(term) ||
        line.endSubstation.toLowerCase().includes(term)
      );
    }
    
    // 电压等级筛选
    if (selectedVoltage !== 'all') {
      result = result.filter(line => line.voltageLevel === selectedVoltage);
    }
    
    // 状态筛选
    if (selectedStatus !== 'all') {
      result = result.filter(line => line.status === selectedStatus);
    }
    
    setFilteredLines(result);
  }, [lines, searchTerm, selectedVoltage, selectedStatus]);
  
  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      fetchLines();
      toast.success('输电线路数据已更新');
    }, 800);
  };
  
  // 重置筛选器
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedVoltage('all');
    setSelectedStatus('all');
  };
  
  // 生成状态摘要
  const getStatusSummary = () => {
    const summary = {
      normal: lines.filter(line => line.status === 'normal').length,
      warning: lines.filter(line => line.status === 'warning').length,
      error: lines.filter(line => line.status === 'error').length,
      totalLength: lines.reduce((sum, line) => sum + line.length, 0).toFixed(1)
    };
    return summary;
  };
  
  const statusSummary = getStatusSummary();
  
  return (
    <div className="flex flex-col h-full">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">输电系统</h1>
          <p className="text-gray-500 mt-1">监控和管理输电线路运行状态与负载情况</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
          >
            <i className="fa-solid fa-sync-alt mr-2"></i>
            刷新数据
          </button>
          <button 
            onClick={() => toast.info('功能开发中，敬请期待')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-150"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            添加线路
          </button>
        </div>
      </div>
      
      {/* 线路概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">线路总数</h3>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fa-solid fa-cable text-blue-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{lines.length}</p>
          <p className="text-xs text-gray-500 mt-1">条线路</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">总长度</h3>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fa-solid fa-road text-green-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{statusSummary.totalLength}</p>
          <p className="text-xs text-gray-500 mt-1">公里</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">平均负载率</h3>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-purple-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {lines.length > 0 
              ? (lines.reduce((sum, line) => sum + line.loadRate, 0) / lines.length).toFixed(1)
              : '0.0'
            }%
          </p>
          <p className="text-xs text-gray-500 mt-1">线路负载情况</p>
        </div>
      </div>
      
      {/* 线路负载趋势图 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">线路负载趋势</h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loadData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                }}
                formatter={(value, name) => [name === '电流' ? `${value} A` : `${value}%`, name === '电流' ? '电流' : '负载率']}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="电流" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="电流"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="负载率" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="负载率"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 状态摘要 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatusBadge status="normal" count={statusSummary.normal} />
        <StatusBadge status="warning" count={statusSummary.warning} />
        <StatusBadge status="error" count={statusSummary.error} />
        <div className="ml-auto text-sm text-gray-500">
          共 {lines.length} 条线路，总长 {statusSummary.totalLength} 公里
        </div>
      </div>
      
      {/* 筛选器 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-solid fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="搜索线路名称、变电站..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* 电压等级筛选 */}
          <div>
            <select
              value={selectedVoltage}
              onChange={(e) => setSelectedVoltage(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            >
              {voltageLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          {/* 状态筛选和重置按钮 */}
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
      
      {/* 线路列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-12 bg-gray-100"></div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLines.map((line) => (
            <LineCard key={line.id} line={line} />
          ))}
        </div>
      ) : (
        <Empty message="没有找到匹配的输电线路" icon="fa-cable" />
      )}
    </div>
  );
}