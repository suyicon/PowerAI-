import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import StatusBadge from '@/components/StatusBadge';
import { Empty } from '@/components/Empty';
import { toast } from 'sonner';
import { db } from '@/lib/db';

// 定义配电线路接口
interface DistributionLine {
  id: string;
  name: string;
  voltageLevel: string;
  length: number;
  area: string;
  status: 'normal' | 'warning' | 'error';
  loadRate: number;
  current: number;
  voltage: number;
  powerFactor: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

// 定义配电区域接口
interface DistributionArea {
  id: string;
  name: string;
  totalLoad: number;
  customerCount: number;
  feederCount: number;
  status: 'normal' | 'warning' | 'error';
}

// 模拟区域负载数据
const areaLoadData = [
  { name: '商业区', 平均负载: 78, 峰值负载: 92 },
  { name: '居民区', 平均负载: 56, 峰值负载: 75 },
  { name: '工业区', 平均负载: 85, 峰值负载: 98 },
  { name: '农业区', 平均负载: 32, 峰值负载: 45 },
  { name: '混合区', 平均负载: 64, 峰值负载: 82 },
];

// 模拟电压水平数据
const voltageData = [
  { time: '00:00', 电压: 220 },
  { time: '04:00', 电压: 223 },
  { time: '08:00', 电压: 218 },
  { time: '12:00', 电压: 215 },
  { time: '16:00', 电压: 212 },
  { time: '20:00', 电压: 210 },
  { time: '24:00', 电压: 217 },
];

// 电压等级过滤器
const voltageLevels = [
  { id: 'all', name: '所有电压' },
  { id: '10kV', name: '10kV' },
  { id: '6kV', name: '6kV' },
  { id: '0.4kV', name: '0.4kV' }
];

// 线路状态过滤器
const statusOptions = [
  { id: 'all', name: '所有状态' },
  { id: 'normal', name: '正常' },
  { id: 'warning', name: '注意' },
  { id: 'error', name: '故障' }
];

// 配电线路卡片组件
const LineCard = ({ line }: { line: DistributionLine }) => {
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
            <p className="text-sm text-gray-500 mt-1">{line.voltageLevel} · {line.area} · {line.length} km</p>
          </div>
          <StatusBadge status={line.status} />
        </div>
      </div>
      
      {/* 线路详情 */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">负载率</p>
            <p className="text-sm font-medium text-gray-900">{line.loadRate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">电压</p>
            <p className="text-sm font-medium text-gray-900">{line.voltage}V</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">功率因数</p>
            <p className="text-sm font-medium text-gray-900">{line.powerFactor.toFixed(2)}</p>
          </div>
        </div>
        
        {/* 负载率进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">负载情况</span>
            <span className="font-medium">{line.current}A</span>
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
        
        {/* 维护信息 */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>上次维护: {line.lastMaintenance}</span>
          <span>下次维护: {line.nextMaintenance}</span>
        </div>
      </div>
    </div>
  );
};

// 配电区域卡片组件
const AreaCard = ({ area }: { area: DistributionArea }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{area.name}</h3>
          <StatusBadge status={area.status} />
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">总负载</p>
            <p className="text-sm font-medium text-gray-900">{area.totalLoad}kW</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">用户数</p>
            <p className="text-sm font-medium text-gray-900">{area.customerCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">馈线数</p>
            <p className="text-sm font-medium text-gray-900">{area.feederCount}</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              area.status === 'error' ? 'bg-red-500' : area.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, area.totalLoad)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function DistributionSystem() {
  // 状态管理
  const [distributionLines, setDistributionLines] = useState<DistributionLine[]>([]);
  const [distributionAreas, setDistributionAreas] = useState<DistributionArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoltage, setSelectedVoltage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filteredLines, setFilteredLines] = useState<DistributionLine[]>([]);

  // 获取配电系统数据
  const fetchDistributionData = useCallback(() => {
    try {
      setLoading(true);
      
      // 获取变电站数据用于关联
      const substations = db.getSubstations();
      
      // 生成模拟配电区域数据
      const mockAreas: DistributionArea[] = [
        {
          id: 'DA-001',
          name: '城东区域',
          totalLoad: 68,
          customerCount: 1256,
          feederCount: 8,
          status: 'normal'
        },
        {
          id: 'DA-002',
          name: '城西区域',
          totalLoad: 75,
          customerCount: 987,
          feederCount: 6,
           status: 'normal'
        },
        {
          id: 'DA-003', 
          name: '城南区域',
          totalLoad: 82,
          customerCount: 1542,
          feederCount: 10,
           status: 'normal'
        },
        {
          id: 'DA-004',
          name: '城北区域',
          totalLoad: 45,
          customerCount: 753,
          feederCount: 5,
          status: 'normal'
        }
      ];
      
      // 生成模拟配电线路数据
      const mockLines: DistributionLine[] = [
        {
          id: 'DL-061',
          name: '城东I线',
          voltageLevel: '10kV',
          length: 8.5,
          area: '城东区域',
          status: 'normal',
          loadRate: 58,
          current: 320,
          voltage: 10.5,
          powerFactor: 0.92,
  lastMaintenance: '2025-08-15',
  nextMaintenance: '2025-11-15'
        },
        {
          id: 'DL-062',
          name: '城东II线',
          voltageLevel: '10kV',
          length: 6.2,
          area: '城东区域',
          status: 'warning',
          loadRate: 76,
          current: 410,
          voltage: 10.2,
          powerFactor: 0.89,
  lastMaintenance: '2025-08-10',
  nextMaintenance: '2025-11-10'
        },
        {
          id: 'DL-063',
          name: '城西I线',
          voltageLevel: '10kV',
          length: 10.8,
          area: '城西区域',
           status: 'normal',
          loadRate: 92,
          current: 490,
          voltage: 9.8,
          powerFactor: 0.85,
  lastMaintenance: '2025-08-05',
  nextMaintenance: '2025-09-20'
        },
        {
          id: 'DL-064',
          name: '城西II线',
          voltageLevel: '10kV',
          length: 7.3,
          area: '城西区域',
          status: 'normal',
          loadRate: 52,
          current: 285,
          voltage: 10.6,
          powerFactor: 0.93,
  lastMaintenance: '2025-08-18',
  nextMaintenance: '2025-11-18'
        },
        {
          id: 'DL-065',
          name: '城南I线',
          voltageLevel: '10kV',
          length: 9.4,
          area: '城南区域',
          status: 'warning',
          loadRate: 79,
          current: 425,
          voltage: 10.1,
          powerFactor: 0.90,
  lastMaintenance: '2025-08-12',
  nextMaintenance: '2025-11-12'
        },
        {
          id: 'DL-066',
          name: '城北I线',
          voltageLevel: '10kV',
          length: 5.7,
          area: '城北区域',
          status: 'normal',
          loadRate: 45,
          current: 245,
          voltage: 10.7,
          powerFactor: 0.94,
  lastMaintenance: '2025-08-20',
  nextMaintenance: '2025-11-20'
        }
      ];
      
      setDistributionAreas(mockAreas);
      setDistributionLines(mockLines);
      setFilteredLines(mockLines);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load distribution data:', error);
      toast.error('加载配电系统数据失败，请刷新页面重试');
      setLoading(false);
    }
  }, []);
  
  // 初始加载和数据变更订阅
  useEffect(() => {
    fetchDistributionData();
    
    // 订阅数据变更
    const handleDataChange = () => {
      fetchDistributionData();
    };
    
    db.subscribe(handleDataChange);
    
    return () => {
      db.unsubscribe(handleDataChange);
    };
  }, [fetchDistributionData]);
  
  // 筛选线路
  useEffect(() => {
    let result = [...distributionLines];
    
    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(line => 
        line.name.toLowerCase().includes(term) || 
        line.id.toLowerCase().includes(term) ||
        line.area.toLowerCase().includes(term)
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
  }, [distributionLines, searchTerm, selectedVoltage, selectedStatus]);
  
  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      fetchDistributionData();
      toast.success('配电系统数据已更新');
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
      normal: distributionLines.filter(line => line.status === 'normal').length,
      warning: distributionLines.filter(line => line.status === 'warning').length,
      error: distributionLines.filter(line => line.status === 'error').length,
      totalLength: distributionLines.reduce((sum, line) => sum + line.length, 0).toFixed(1)
    };
    return summary;
  };
  
  const statusSummary = getStatusSummary();
  
  return (
    <div className="flex flex-col h-full">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">配电系统</h1>
          <p className="text-gray-500 mt-1">监控和管理配电网络运行状态与负载情况</p>
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
      
      {/* 配电系统概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">线路总数</h3>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fa-solid fa-cable text-blue-600"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{distributionLines.length}</p>
          <p className="text-xs text-gray-500 mt-1">条配电线路</p>
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
            {distributionLines.length > 0 
              ? (distributionLines.reduce((sum, line) => sum + line.loadRate, 0) / distributionLines.length).toFixed(1)
              : '0.0'
            }%
          </p>
          <p className="text-xs text-gray-500 mt-1">系统负载水平</p>
        </div>
      </div>
      
      {/* 区域负载和电压监控图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 区域负载对比 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">区域负载分布</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={areaLoadData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fof0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 十二px rgba(0, 0, 0, 0.1)' 
                  }}
                  formatter={(value) => [`${value}%`, '负载率']}
                />
                <Legend />
                <Bar dataKey="平均负载" name="平均负载" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="峰值负载" name="峰值负载" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 电压监控 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">电压水平监测</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={voltageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fof0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 十二px rgba(0, 0, 0, 0.1)' 
                  }}
                  formatter={(value) => [`${value}kV`, '电压']}
                />
                <Line 
                  type="monotone" 
                  dataKey="电压" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="电压水平"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* 配电区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">配电区域概览</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {distributionAreas.map(area => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </div>
      
      {/* 状态摘要 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatusBadge status="normal" count={statusSummary.normal} />
        <StatusBadge status="warning" count={statusSummary.warning} />
        <StatusBadge status="error" count={statusSummary.error} />
        <div className="ml-auto text-sm text-gray-500">
          共 {distributionLines.length} 条线路，总长 {statusSummary.totalLength} 公里
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
              placeholder="搜索线路名称、ID或区域..."
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="flex justify-between text-xs">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
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
        <Empty message="没有找到匹配的配电线路" icon="fa-network-wired" />
      )}
    </div>
  );
}