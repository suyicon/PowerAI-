import { useState, useEffect, useCallback } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

import { toast } from "sonner";
import { db, Equipment, Alert } from "@/lib/db";
import EquipmentCard from "@/components/EquipmentCard";
import { Substation } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import { Empty } from "@/components/Empty";
import AIFaultProcessing from "@/components/AIFaultProcessing";
import AIExpertChat from "@/components/AIExpertChat";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [substations, setSubstations] = useState<Substation[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);

    const [equipmentStatusData, setEquipmentStatusData] = useState([{
        name: "变压器",
        normal: 0,
        warning: 0,
        error: 0
    }, {
        name: "断路器",
        normal: 0,
        warning: 0,
        error: 0
    }, {
        name: "隔离开关",
        normal: 0,
        warning: 0,
        error: 0
    }, {
        name: "互感器",
        normal: 0,
        warning: 0,
        error: 0
    }, {
        name: "避雷器",
        normal: 0,
        warning: 0,
        error: 0
    }]);

    const [equipmentTypeData, setEquipmentTypeData] = useState([{
        name: "变压器",
        value: 0
    }, {
        name: "断路器",
        value: 0
    }, {
        name: "隔离开关",
        value: 0
    }, {
        name: "互感器",
        value: 0
    }, {
        name: "避雷器",
        value: 0
    }]);

    const calculateEquipmentStatusData = (equipment: Equipment[]) => {
        const statusData = [{
            name: "变压器",
            normal: 0,
            warning: 0,
            error: 0
        }, {
            name: "断路器",
            normal: 0,
            warning: 0,
            error: 0
        }, {
            name: "隔离开关",
            normal: 0,
            warning: 0,
            error: 0
        }, {
            name: "互感器",
            normal: 0,
            warning: 0,
            error: 0
        }, {
            name: "避雷器",
            normal: 0,
            warning: 0,
            error: 0
        }];

        equipment.forEach(eq => {
            const index = statusData.findIndex(item => item.name === eq.type);

            if (index !== -1) {
                if (eq.status === "normal")
                    statusData[index].normal++;
                else if (eq.status === "warning")
                    statusData[index].warning++;
                else if (eq.status === "error")
                    statusData[index].error++;
            }
        });

        return statusData;
    };

    const calculateEquipmentTypeData = (equipment: Equipment[]) => {
        const typeData = [{
            name: "变压器",
            value: 0
        }, {
            name: "断路器",
            value: 0
        }, {
            name: "隔离开关",
            value: 0
        }, {
            name: "互感器",
            value: 0
        }, {
            name: "避雷器",
            value: 0
        }];

        equipment.forEach(eq => {
            const index = typeData.findIndex(item => item.name === eq.type);

            if (index !== -1) {
                typeData[index].value++;
            }
        });

        return typeData;
    };

    const calculateKpiData = () => {
        const totalEquipment = equipment.length;
        const normalEquipment = equipment.filter(eq => eq.status === "normal").length;
        const warningEquipment = equipment.filter(eq => eq.status === "warning").length;
        const errorEquipment = equipment.filter(eq => eq.status === "error").length;
        const operationRate = totalEquipment > 0 ? (normalEquipment / totalEquipment * 100).toFixed(1) : "0.0";
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const maintenanceRecords = db.getMaintenanceRecords();

        const monthlyMaintenance = maintenanceRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        });

        return [{
            title: "总设备数",
            value: totalEquipment,
            icon: "fa-microchip",
            trend: "up",
            change: 2
        }, {
            title: "运行率",
            value: `${operationRate}%`,
            icon: "fa-check-circle",
            trend: "up",
            change: 0.5
        }, {
            title: "平均响应时间",
            value: "18分钟",
            icon: "fa-clock",
            trend: "down",
            change: 3
        }, {
            title: "本月维护次数",
            value: monthlyMaintenance.length,
            icon: "fa-tools",
            trend: "up",
            change: 5
        }];
    };

    const kpiData = calculateKpiData();
    const faultCount = equipment.filter(eq => eq.status === "error").length;
    const [loading, setLoading] = useState(true);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [ragDataLoaded, setRagDataLoaded] = useState(false);

    const loadData = useCallback(() => {
        try {
            const equipmentData = db.getEquipment();
            const alertsData = db.getAlerts();
            const substationsData = db.getSubstations();
            const sortedAlerts = [...alertsData].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
            setEquipment(equipmentData);
            setSubstations(substationsData);
            setRecentAlerts(sortedAlerts);
            const statusData = calculateEquipmentStatusData(equipmentData);
            const typeData = calculateEquipmentTypeData(equipmentData);
            setEquipmentStatusData(statusData);
            setEquipmentTypeData(typeData);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("加载数据失败，请刷新页面重试");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        const handleDataChange = () => {
            loadData();
        };

        db.subscribe(handleDataChange);

        return () => {
            db.unsubscribe(handleDataChange);
        };
    }, [loadData]);

    const [powerConsumptionData] = useState([{
        name: "1月",
        value: 4500
    }, {
        name: "2月",
        value: 5200
    }, {
        name: "3月",
        value: 4900
    }, {
        name: "4月",
        value: 5800
    }, {
        name: "5月",
        value: 6200
    }, {
        name: "6月",
        value: 7100
    }]);

    const handleSimulateAlert = () => {
        try {
            const allEquipment = db.getEquipment().filter(eq => eq.substationId);

            if (allEquipment.length === 0) {
                toast.error("没有可用设备，无法生成告警");
                return;
            }

            const activeAlerts = db.getAlerts();
            const alertedEquipmentIds = activeAlerts.map(alert => alert.equipmentId);
            const availableEquipment = allEquipment.filter(eq => !alertedEquipmentIds.includes(eq.id));

            if (availableEquipment.length === 0) {
                toast.warning("所有设备都已有活跃告警，无法生成新告警");
                return;
            }

            const randomIndex = Math.floor(Math.random() * availableEquipment.length);
            const selectedEquipment = availableEquipment[randomIndex];

            const faultTypes = [
                "温度过高",
                "电流异常",
                "电压波动",
                "振动异常",
                "连接松动",
                "绝缘降低",
                "机械故障",
                "通讯中断",
                "压力异常",
                "气体泄漏"
            ];

            const randomFaultIndex = Math.floor(Math.random() * faultTypes.length);
            const isError = Math.random() > 0.3;

            const newAlert = {
                equipmentId: selectedEquipment.id,
                equipmentName: selectedEquipment.name,
                equipmentType: selectedEquipment.type,
                message: `${faultTypes[randomFaultIndex]}`,
                level: isError ? "error" : "warning",
                time: new Date().toLocaleString(),
                status: "pending"
            };

            db.addAlert(newAlert);

            db.updateEquipment(selectedEquipment.id, {
                status: newAlert.level === "error" ? "error" : "warning",
                temperature: isError ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20) + 60,
                current: isError ? Math.floor(Math.random() * 50) + 150 : Math.floor(Math.random() * 30) + 80,
                load: isError ? 0 : Math.floor(Math.random() * 20) + 80
            });

            toast.success(`已为 ${selectedEquipment.name} 生成模拟告警`);
        } catch (error) {
            console.error("Error generating simulated alert:", error);
            toast.error("生成告警时出错，请重试");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            toast.success("数据已更新");
        }, 800);
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150">
                        <i className="fa-solid fa-sync-alt mr-2"></i>刷新数据
                                                          </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map(i => <div
                        key={i}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2 animate-pulse h-80"></div>
                    <div
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
                    <div
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {}
            <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
                    <p className="text-gray-500 mt-1">实时监控电网设备运行状态和关键指标</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150">
                        <i className="fa-solid fa-sync-alt mr-2"></i>刷新数据
                                                          </button>
                    {/* <button
                        onClick={() => toast.info("报表已生成并发送到您的邮箱")}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-150">
                        <i className="fa-solid fa-file-export mr-2"></i>导出报表
                                                          </button> */}
                </div>
            </div>
            {}
            {}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">变电站概览</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {substations.map(substation => <div
                        key={substation.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition duration-200">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col items-center w-full">
                                <div
                                    className="w-16 h-16 rounded-lg overflow-hidden mb-3 bg-gray-50 flex items-center justify-center">
                                     <img
                                        src={(() => {
                                          switch(substation.id) {
                                            case 'SUB-001':
                                              return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=%E5%9F%8E%E5%8C%97%E5%8F%98%E7%94%B5%E7%AB%99%E5%A4%96%E8%A7%82%2C%E9%AB%98%E5%8E%8B%E8%AE%BE%E5%A4%87%2C%E7%94%B5%E5%8A%9B%E8%AE%BE%E6%96%BD&sign=94320115aa8e7156027f521fe9a1082d';
                                            case 'SUB-002':
                                              return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=%E5%9F%8E%E5%8D%97%E5%8F%98%E7%94%B5%E7%AB%99%E5%A4%96%E8%A7%82%2C%E7%8E%B0%E4%BB%A3%E5%8C%96%E7%94%B5%E5%8A%9B%E8%AE%BE%E5%A4%87&sign=19e9499b7a0710f6e6c5804892a14c5c';
                                            case 'SUB-003':
                                              return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=%E5%9F%8E%E4%B8%9C%E5%8F%98%E7%94%B5%E7%AB%99%E5%A4%96%E8%A7%82%2C%E5%B7%A5%E4%B8%9A%E5%8C%BA%E7%94%B5%E5%8A%9B%E8%AE%BE%E6%96%BD&sign=6756bc8b6efa4019bbcec6e03639817f';
                                            default:
                                              return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=%E7%94%B5%E5%8A%9B%E5%8F%98%E7%94%B5%E7%AB%99%E5%A4%96%E8%A7%82&sign=b60d9e39f91653614895ddf1beb146ea';
                                          }
                                        })()}
                                        alt={`${substation.name} logo`}
                                        className="w-full h-full object-contain" />
                                </div>
                                <h3 className="font-medium text-gray-900">{substation.name}</h3>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 text-center">{substation.location}</p>
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-gray-500">{substation.capacity}</span>
                            <span className="text-xs text-gray-500">设备: {substation.equipmentIds.length}台</span>
                        </div>
                    </div>)}
                </div>
            </div>
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpiData.map((kpi, index) => <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">{kpi.title}</h3>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.trend === "up" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                            <i className={`fa-solid ${kpi.icon}`}></i>
                        </div>
                    </div>
                    <div className="mt-2 flex items-end justify-between">
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        <div
                            className={`flex items-center text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                            <i
                                className={`fa-solid fa-arrow-${kpi.trend === "up" ? "up" : "down"} mr-1`}></i>
                            {kpi.change}%
                                                                      </div>
                    </div>
                </div>)}
            </div>
            {}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {}
                <div
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">电力消耗趋势</h2>
                        <div className="flex space-x-2">
                            <button
                                className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">月度</button>
                            <button
                                className="px-3 py-1 text-xs font-medium rounded-full text-gray-500 hover:bg-gray-100">季度</button>
                            <button
                                className="px-3 py-1 text-xs font-medium rounded-full text-gray-500 hover:bg-gray-100">年度</button>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={powerConsumptionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false} />
                                <YAxis
                                    tick={{
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                                    }} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{
                                        r: 4
                                    }}
                                    activeDot={{
                                        r: 6,
                                        strokeWidth: 0
                                    }}
                                    name="电力消耗 (kWh)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">设备类型分布</h2>
                        <button className="text-gray-400 hover:text-gray-600">
                            <i className="fa-solid fa-ellipsis-v"></i>
                        </button>
                    </div>
                    <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={equipmentTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={(
                                        {
                                            name,
                                            percent
                                        }
                                    ) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}>
                                    {equipmentTypeData.map(
                                        (entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    )}
                                </Pie>
                                <Tooltip
                                    formatter={value => [`${value}台`, "数量"]}
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                                    }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">设备状态分布</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">查看全部 <i className="fa-solid fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={equipmentStatusData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5
                                }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false} />
                                <YAxis
                                    tick={{
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                                    }} />
                                <Legend />
                                <Bar dataKey="normal" name="正常" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="warning" name="注意" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="error" name="故障" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">最近告警</h2>
                        <StatusBadge
                            status={recentAlerts.some(a => a.level === "error") ? "error" : "warning"}
                            count={recentAlerts.length} />
                        <button
                            onClick={handleSimulateAlert}
                            className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-150 flex items-center">
                            <i className="fa-solid fa-exclamation-circle mr-1.5"></i>模拟告警
                                                                  </button>
                    </div>
                    {recentAlerts.length > 0 ? <div className="space-y-4">
                        {recentAlerts.map(alert => <div
                            key={alert.id}
                            className="flex items-start p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all duration-300 animate-fadeIn"
                            style={{
                                opacity: 1,
                                transform: "translateY(0)",
                                height: "auto",
                                overflow: "hidden"
                            }}>
                            <div
                                className={`mt-1 mr-3 w-3 h-3 rounded-full ${alert.level === "error" ? "bg-red-500" : "bg-yellow-500"}`}></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{alert.equipmentName}</p>
                                <p className="text-xs text-gray-500">变电站: {alert.substationName}</p>
                                <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                            </div>
                            <div className="ml-4 text-right">
                                <p className="text-xs text-gray-500">{alert.time}</p>
                                <button
                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                        setSelectedAlert(alert);
                                        setShowAlertModal(true);
                                    }}>处理
                                                                                             </button>
                            </div>
                        </div>)}
                    </div> : <Empty message="暂无告警信息" icon="fa-bell-slash" />}
                </div>
            </div>
            {}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">电力系统智能分析</h2>
                </div>
                <div className="h-[500px]">
                    <AIExpertChat />
                </div>
            </div>
            <AIFaultProcessing
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                record={selectedAlert} />
        </div>
    );
}