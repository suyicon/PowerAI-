import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

import StatusBadge from '@/components/StatusBadge';
import { Empty } from '@/components/Empty';

// Mock data for reports
const equipmentStatusData = [
  { name: '变压器', normal: 12, warning: 3, error: 1 },
  { name: '断路器', normal: 28, warning: 5, error: 2 },
  { name: '隔离开关', normal: 45, warning: 8, error: 0 },
  { name: '互感器', normal: 18, warning: 2, error: 1 },
  { name: '避雷器', normal: 32, warning: 4, error: 0 },
];

const monthlyMaintenanceData = [
  { month: '1月', 预防性维护: 12, 定期检查: 25, 故障维修: 8 },
  { month: '2月', 预防性维护: 15, 定期检查: 22, 故障维修: 5 },
  { month: '3月', 预防性维护: 18, 定期检查: 30, 故障维修: 12 },
  { month: '4月', 预防性维护: 14, 定期检查: 28, 故障维修: 7 },
  { month: '5月', 预防性维护: 16, 定期检查: 26, 故障维修: 9 },
  { month: '6月', 预防性维护: 20, 定期检查: 32, 故障维修: 15 },
];

const equipmentFailureRateData = [
  { name: '变压器', failureRate: 2.3, maintenanceCount: 15 },
  { name: '断路器', failureRate: 4.7, maintenanceCount: 35 },
  { name: '隔离开关', failureRate: 1.2, maintenanceCount: 53 },
  { name: '互感器', failureRate: 3.5, maintenanceCount: 21 },
  { name: '避雷器', failureRate: 0.8, maintenanceCount: 36 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  normal: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

// Report types
const reportTypes = [
  { id: 'overview', name: '概览报告' },
  { id: 'equipment', name: '设备状态报告' },
  { id: 'maintenance', name: '维护分析报告' },
  { id: 'failure', name: '故障分析报告' }
];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('monthly');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle refresh data
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('报表数据已更新');
    }, 800);
  };

  // Generate equipment status summary
  const getStatusSummary = () => {
    const summary = {
      normal: 0,
      warning: 0,
      error: 0
    };
    
    equipmentStatusData.forEach(item => {
      summary.normal += item.normal;
      summary.warning += item.warning;
      summary.error += item.error;
    });
    
    return summary;
  };

  const statusSummary = getStatusSummary();
  const totalEquipment = statusSummary.normal + statusSummary.warning + statusSummary.error;
  const equipmentHealthRate = ((statusSummary.normal / totalEquipment) * 100).toFixed(1);

  // Render report content based on selected type
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
        </div>
      );
    }

    switch (reportType) {
      case 'overview':
        return renderOverviewReport();
      case 'equipment':
        return renderEquipmentReport();
      case 'maintenance':
        return renderMaintenanceReport();
      case 'failure':
        return renderFailureReport();
      default:
        return renderOverviewReport();
    }
  };

  // Overview report
  function renderOverviewReport() {
    return (
      <div className="space-y-6">
        {/* KPI summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">总设备数</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalEquipment}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <i className="fa-solid fa-arrow-up mr-1"></i>
              较上月增长 3.2%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">设备健康率</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{equipmentHealthRate}%</p>
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <i className="fa-solid fa-arrow-down mr-1"></i>
              较上月下降 0.5%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">本月维护次数</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">67</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <i className="fa-solid fa-arrow-up mr-1"></i>
              较上月增长 12.5%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">平均故障修复时间</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">2.4h</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <i className="fa-solid fa-arrow-down mr-1"></i>
              较上月缩短 0.3h
            </p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment status chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">设备状态分布</h2>
              <StatusBadge status="normal" count={statusSummary.normal} />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={equipmentStatusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="normal" name="正常" fill={STATUS_COLORS.normal} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="warning" name="注意" fill={STATUS_COLORS.warning} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="error" name="故障" fill={STATUS_COLORS.error} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Maintenance trend chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">维护趋势分析</h2>
              <div className="flex space-x-2">
                <button className={`px-3 py-1 text-xs font-medium rounded-full ${timeRange === 'monthly' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setTimeRange('monthly')}>月度</button>
                <button className={`px-3 py-1 text-xs font-medium rounded-full ${timeRange === 'quarterly' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setTimeRange('quarterly')}>季度</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyMaintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="预防性维护" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="定期检查" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="故障维修" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Equipment status report
  function renderEquipmentReport() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status summary cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">正常设备</h3>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statusSummary.normal}</p>
            <p className="text-sm text-gray-500 mt-1">{((statusSummary.normal / totalEquipment) * 100).toFixed(1)}% of total</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${(statusSummary.normal / totalEquipment) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">需注意设备</h3>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statusSummary.warning}</p>
            <p className="text-sm text-gray-500 mt-1">{((statusSummary.warning / totalEquipment) * 100).toFixed(1)}% of total</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${(statusSummary.warning / totalEquipment) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">故障设备</h3>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statusSummary.error}</p>
            <p className="text-sm text-gray-500 mt-1">{((statusSummary.error / totalEquipment) * 100).toFixed(1)}% of total</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${(statusSummary.error / totalEquipment) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Equipment status chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">设备类型状态分布</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={equipmentStatusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="normal" name="正常" fill={STATUS_COLORS.normal} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="warning" name="注意" fill={STATUS_COLORS.warning} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="error" name="故障" fill={STATUS_COLORS.error} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">设备类型占比</h2>
            </div>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentStatusData.map(item => ({
                      name: item.name,
                      value: item.normal + item.warning + item.error
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {equipmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}台`, '数量']}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Maintenance analysis report
  function renderMaintenanceReport() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly maintenance chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">月度维护统计</h2>
              <div className="flex space-x-2">
                <button className={`px-3 py-1 text-xs font-medium rounded-full ${timeRange === 'monthly' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setTimeRange('monthly')}>月度</button>
                <button className={`px-3 py-1 text-xs font-medium rounded-full ${timeRange === 'quarterly' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setTimeRange('quarterly')}>季度</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyMaintenanceData}>
                  <defs>
                    <linearGradient id="colorPreventive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRegular" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRepair" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="预防性维护" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorPreventive)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="定期检查" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorRegular)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="故障维修" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorRepair)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Maintenance type distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">维护类型占比</h2>
            </div>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '预防性维护', value: monthlyMaintenanceData.reduce((sum, item) => sum + item.预防性维护, 0) },
                      { name: '定期检查', value: monthlyMaintenanceData.reduce((sum, item) => sum + item.定期检查, 0) },
                      { name: '故障维修', value: monthlyMaintenanceData.reduce((sum, item) => sum + item.故障维修, 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}次`, '数量']}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failure analysis report
  function renderFailureReport() {
    return (
      <div className="space-y-6">

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Failure rate chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">设备故障率分析</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={equipmentFailureRateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="failureRate" name="故障率 (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="maintenanceCount" name="维护次数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Failure trend chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">故障趋势分析</h2>
              <div className="flex space-x-2">
                <button className={`px-3 py-1 text-xs font-medium rounded-full ${timeRange === 'monthly' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setTimeRange('monthly')}>月度</button>
                <button className={`px-3 py-1 text-xs font-medium rounded-full ${timeRange === 'quarterly' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setTimeRange('quarterly')}>季度</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyMaintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="故障维修" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="故障维修次数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据分析报表</h1>
          <p className="text-gray-500 mt-1">查看和分析设备运行数据与维护记录</p>
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
            onClick={() => toast.info('报表已生成并发送到您的邮箱')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-150"
          >
            <i className="fa-solid fa-file-export mr-2"></i>
            导出报表
          </button>
        </div>
      </div>

      {/* Report type tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
        <div className="flex overflow-x-auto scrollbar-hide space-x-1">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                reportType === type.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Report content */}
      {renderReportContent()}
    </div>
  );
}