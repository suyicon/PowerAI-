import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import StatusBadge from '@/components/StatusBadge';

import { Empty } from '@/components/Empty';
import { toast } from 'sonner';

// 从localStorage获取设备详情数据
const getEquipmentDetails = (equipmentId: string) => {
  const savedEquipment = localStorage.getItem('equipmentData');
  if (savedEquipment) {
    try {
      const equipmentList = JSON.parse(savedEquipment);
      const equipment = equipmentList.find((eq: any) => eq.id === equipmentId);
      
      if (equipment) {
        // 为设备添加详细信息（模拟数据）
        return {
          ...equipment,
          model: equipment.type === '变压器' ? 'S11-M-1000/10' : 
                 equipment.type === '断路器' ? 'ZN63A-12/630-20' :
                 equipment.type === '隔离开关' ? 'GW4-12/630' :
                 equipment.type === '互感器' ? 'JDZ10-10' : 'HY5WS-17/50',
          manufacturer: '电力设备集团有限公司',
          installationDate: '2022-01-28',
          voltage: equipment.type === '变压器' ? 10.5 : 12.0,
          current: equipment.status === 'error' ? 0 : Math.floor(Math.random() * 50 + 30),
          load: equipment.status === 'error' ? 0 : Math.floor(Math.random() * 40 + 50),
  lastMaintenance: '2025-04-28',
  nextMaintenance: '2025-07-28',
          specifications: equipment.type === '变压器' ? {
            ratedCapacity: '1000 kVA',
            primaryVoltage: '10 kV',
            secondaryVoltage: '0.4 kV',
            connectionGroup: 'Dyn11',
            coolingMethod: 'ONAN',
            impedanceVoltage: '4%'
          } : equipment.type === '断路器' ? {
            ratedVoltage: '12 kV',
            ratedCurrent: '630 A',
            ratedBreakingCurrent: '20 kA',
            operatingMechanism: '弹簧操作',
            insulationClass: '30 kV'
          } : {
            ratedVoltage: '10 kV',
            ratedCurrent: '600 A',
            accuracyClass: '0.5',
            temperatureRange: '-40℃ ~ 70℃'
          },
          maintenanceHistory: [
  { id: 'M-001', date: '2025-04-28', type: '定期检查', content: '机械特性测试和绝缘电阻测试', technician: '刘工' },
  { id: 'M-002', date: '2025-01-15', type: '预防性维护', content: '操作机构检查和润滑', technician: '赵工' }
          ],
          alertHistory: equipment.status !== 'normal' ? [
  { id: 'A-001', date: '2025-06-14', type: equipment.status === 'error' ? '操作故障' : '温度高', 
              message: equipment.status === 'error' ? '分闸操作失败' : '温度达到阈值 65°C', status: '未处理' },
  { id: 'A-002', date: '2025-03-22', type: 'SF6气压低', message: '气体压力低于报警阈值', status: '已处理' }
          ] : []
        };
      }
    } catch (error) {
      console.error('Failed to parse equipment data:', error);
    }
  }
  
  // 如果localStorage中没有数据，返回默认设备信息
  return {
    id: equipmentId,
    name: '未知设备',
    type: '未知类型',
    model: 'N/A',
    manufacturer: '未知厂商',
    installationDate: 'N/A',
    location: '未知位置',
    status: 'normal',
    temperature: Math.floor(Math.random() * 30 + 30),
    voltage: 10.0,
    current: Math.floor(Math.random() * 50 + 30),
    load: Math.floor(Math.random() * 40 + 50),
    lastMaintenance: 'N/A',
    nextMaintenance: 'N/A',
    specifications: {},
    maintenanceHistory: [],
    alertHistory: []
  };
};

// Generate historical data for charts
const generateHistoricalData = (days = 30, baseValue = 50, variance = 15) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    return {
      date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      temperature: Math.max(20, Math.min(90, baseValue + (Math.random() * variance * 2 - variance))).toFixed(1),
      current: Math.max(0, Math.min(100, (baseValue * 0.8) + (Math.random() * variance - variance/2))).toFixed(1)
    };
  });
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchParams] = useSearchParams();

  // Fetch equipment details
  useEffect(() => {
    if (!id) {
      navigate('/equipment');
      return;
    }
    
    // Simulate API call
    const timer = setTimeout(() => {
       // 从localStorage获取设备详情数据
       const equipmentData = getEquipmentDetails(id);
       setEquipment(equipmentData);
       
       // Generate historical data based on equipment status
      const baseTemp = equipmentData.status === 'error' ? 75 : equipmentData.status === 'warning' ? 65 : 45;
       setHistoricalData(generateHistoricalData(30, baseTemp));
       
       // 从URL参数获取标签页设置
       const tabParam = searchParams.get('tab');
       if (tabParam && ['overview', 'specifications', 'maintenance', 'alerts'].includes(tabParam)) {
         setActiveTab(tabParam);
       }
      
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [id, navigate]);

  // Handle back to list
  const handleBack = () => {
    navigate('/equipment');
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('设备数据已更新');
    }, 800);
  };

  // Handle maintenance record
  const handleAddMaintenance = () => {
    toast.info('正在创建新的维护记录');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-sm text-gray-700 hover:text-gray-900"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            返回列表
          </button>
          <button 
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
          >
            <i className="fa-solid fa-sync-alt mr-2"></i>
            刷新
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-64 bg-gray-100"></div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            
            <div className="h-80 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Empty message="设备不存在或已被删除" icon="fa-exclamation-circle" />
        <button 
          onClick={handleBack}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          返回设备列表
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="flex items-center text-sm text-gray-700 hover:text-gray-900 mr-4"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            返回列表
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
               <div className="flex items-center mt-1 space-x-3">
                 <span className="text-sm text-gray-500">{equipment.id}</span>
                 <StatusBadge status={equipment.status} />
                 <span className="text-xs text-gray-500">
                   变电站 #{equipment.substationId}
                 </span>
               </div>
             </div>
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
               onClick={handleAddMaintenance}
               className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-150"
               disabled={!equipment}
             >
            <i className="fa-solid fa-tools mr-2"></i>
            维护记录
          </button>
        </div>
      </div>

      {/* Equipment image and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Equipment image */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <img 
            src={equipment.imageUrl} 
            alt={equipment.name}
            className="w-full h-64 object-cover"
          />
          
          {/* Alert banner if status is error or warning */}

        </div>
        
        {/* Equipment info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">设备类型</h3>
              <p className="text-base text-gray-900 mt-1">{equipment.type}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">型号规格</h3>
              <p className="text-base text-gray-900 mt-1">{equipment.model}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">生产厂家</h3>
              <p className="text-base text-gray-900 mt-1">{equipment.manufacturer}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">安装位置</h3>
              <p className="text-base text-gray-900 mt-1 flex items-center">
                <i className="fa-solid fa-map-marker-alt mr-2 text-gray-400"></i>
                {equipment.location}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">安装日期</h3>
              <p className="text-base text-gray-900 mt-1">{equipment.installationDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Operational data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">运行温度</h3>
            <i className="fa-solid fa-temperature-half text-red-500"></i>
          </div>
          <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold text-gray-900">{equipment.temperature}</span>
            <span className="text-gray-500 ml-1 mb-1">°C</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  equipment.temperature > 75 ? 'bg-red-500' : equipment.temperature > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (equipment.temperature / 100) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°C</span>
              <span>50°C</span>
              <span>100°C</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">电压</h3>
            <i className="fa-solid fa-bolt text-yellow-500"></i>
          </div>
          <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold text-gray-900">{equipment.voltage}</span>
            <span className="text-gray-500 ml-1 mb-1">kV</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(100, (equipment.voltage / 15) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0kV</span>
              <span>7.5kV</span>
              <span>15kV</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">负载率</h3>
            <i className="fa-solid fa-server text-blue-500"></i>
          </div>
          <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold text-gray-900">{equipment.load}</span>
            <span className="text-gray-500 ml-1 mb-1">%</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  equipment.load > 80 ? 'bg-red-500' : equipment.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${equipment.load}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              运行数据
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'specifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              技术参数
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              维护记录
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              告警历史
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">历史运行数据</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickMargin={10}
                      label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                      }}
                      formatter={(value, name) => [value, name === 'temperature' ? '温度 (°C)' : '电流 (A)']}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f97316" 
                      fillOpacity={1} 
                      fill="url(#colorTemperature)" 
                      name="温度"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">技术参数</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-sm text-gray-500 w-1/3">{key}</span>
                    <span className="text-sm text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-base font-medium text-gray-900 mb-4">维护计划</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">上次维护</h4>
                    <p className="text-base text-gray-900 mt-1">{equipment.lastMaintenance}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">下次维护</h4>
                    <p className="text-base text-gray-900 mt-1">{equipment.nextMaintenance}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">维护记录</h2>
                <button 
                  onClick={handleAddMaintenance}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <i className="fa-solid fa-plus mr-1"></i>
                  添加记录
                </button>
              </div>
              
              {equipment.maintenanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">维护日期</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">维护类型</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">维护人员</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {equipment.maintenanceHistory.map((maintenance) => (
                        <tr key={maintenance.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{maintenance.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {maintenance.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{maintenance.content}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maintenance.technician}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty message="暂无维护记录" icon="fa-tools" />
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">告警历史</h2>
              
              {equipment.alertHistory.length > 0 ? (
                <div className="space-y-4">
                  {equipment.alertHistory.map((alert) => (
                    <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{alert.type}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">{alert.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty message="暂无告警记录" icon="fa-bell-slash" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}