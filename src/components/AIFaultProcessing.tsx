import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import StatusBadge from './StatusBadge';
import { aiService, AIThinkingStep, AISolution, FaultData } from '@/lib/aiService';
import { db } from '@/lib/db';

interface AIFaultProcessingProps {
  visible: boolean;
  onClose: () => void;
  record?: any;
}

// 故障数据表单接口
interface FaultDataForm {
  symptoms: string;
  additionalInfo: string;
}

export default function AIFaultProcessing({ visible, onClose, record }: AIFaultProcessingProps) {
  // 使用更安全的设备ID生成方式，确保唯一性
  const deviceId = record?.equipmentId || `unknown-${Date.now()}`;
  const [currentStep, setCurrentStep] = useState(0);
  const [thinkingText, setThinkingText] = useState("");
  const [solution, setSolution] = useState<AISolution | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<AIThinkingStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<any>(null);

  // 初始化思考步骤和传感器数据
  useEffect(() => {
    if (visible && deviceId) {
      // 从localStorage加载该设备的状态或初始化新状态
      // 确保设备ID唯一且有效
      const safeDeviceId = record?.equipmentId || `unknown-${Date.now()}`;
      const savedState = localStorage.getItem(`ai_analysis_${safeDeviceId}`);
      
      // 初始化新步骤或使用保存的步骤
      const initialSteps = savedState 
        ? JSON.parse(savedState).thinkingSteps
        : aiService.getInitialThinkingSteps().map(step => ({
            ...step,
            status: "pending" // 显式设置初始状态为待处理
          }));
        
      setThinkingSteps(initialSteps);
      setCurrentStep(0);
      setThinkingText("");
      setSolution(null);
      setShowSolution(false);
      setIsProcessing(false);
      setActiveCommand(null);
      
  // 获取真实传感器数据
  if (record?.equipmentId) {
    const equipment = db.getEquipmentById(record.equipmentId);
    if (equipment) {
      setSensorData({
        temperature: equipment.temperature,
        current: equipment.current,
        voltage: equipment.voltage,
        vibration: equipment.load > 80 ? 4.2 : Math.random() * 2 + 1.5,
        imageUrl: equipment.imageUrl
      });
    }
  }
    }
  }, [visible, deviceId]);
  
  // 保存状态到localStorage
  useEffect(() => {
    if (deviceId) {
      localStorage.setItem(`ai_analysis_${deviceId}`, JSON.stringify({
        thinkingSteps,
        solution,
        showSolution
      }));
    }
  }, [thinkingSteps, solution, showSolution, deviceId]);

  // 开始AI分析（使用传感器数据）
  const startAnalysis = async () => {
    if (!record || !sensorData) return;
    
    setIsProcessing(true);
    
    try {
      // 构建故障数据（包含传感器数据）
      const faultData: FaultData = {
        equipmentId: record.equipmentId || "unknown",
        equipmentName: record.equipmentName || "未知设备",
        equipmentType: record.equipmentType || "未知类型",
        faultTime: new Date().toISOString(),
        symptoms: "传感器检测到异常数据",
        sensorData: {
          temperature: sensorData.temperature,
          current: sensorData.current,
          voltage: sensorData.voltage,
          vibration: sensorData.vibration,
          hasVisualAnomaly: true
        }
      };
      
           // 重置所有步骤为pending状态
           setThinkingSteps(aiService.getInitialThinkingSteps().map(step => ({
             ...step,
             status: "pending"
           })));
           
           // 调用AI服务进行分析
      const aiSolution = await aiService.analyzeFault(
        faultData,
        (updatedSteps) => {
          setThinkingSteps(updatedSteps);
          // 更新当前步骤
          const currentActiveStep = updatedSteps.findIndex(
            step => step.status === "in_progress"
          );
          if (currentActiveStep > -1) {
            setCurrentStep(currentActiveStep);
            setThinkingText(updatedSteps[currentActiveStep].details || "正在处理...");
          }
        }
      );
      
      // 分析完成，显示解决方案
      setSolution(aiSolution);
      setShowSolution(true);
    } catch (error) {
      toast.error("AI分析过程中出错，请重试");
      console.error("AI分析错误:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 发送指令到设备
  const sendCommand = async (commandId: string) => {
    if (!record) return;
    
    setActiveCommand(commandId);
    
    try {
      // 调用AI服务发送指令
      const result = await aiService.sendCommand(commandId, record.equipmentId);
      
      if (result.success) {
        toast.success(result.message);
        
        // 更新指令状态
          setSolution(prev => {
            if (!prev) return prev;
            
            const updatedCommands = prev.commands.map(cmd => 
              cmd.id === commandId 
                ? { ...cmd, status: "completed", time: new Date().toLocaleTimeString() } 
                : cmd
            );
            
            // 检查是否所有指令都已完成
            const allCommandsCompleted = updatedCommands.every(cmd => cmd.status === "completed");
            
          // 只有当所有指令都发送完成后，才更新结果验证步骤状态
          if (allCommandsCompleted) {
            const updatedSteps = [...thinkingSteps];
            const resultVerificationStep = updatedSteps.findIndex(step => step.title === "结果验证");
            if (resultVerificationStep !== -1) {
              updatedSteps[resultVerificationStep] = {
                ...updatedSteps[resultVerificationStep],
                status: "completed",
                details: "所有指令已发送完成，正在验证故障是否解决..."
              };
              setThinkingSteps(updatedSteps);
              
              // 模拟结果验证过程
              setTimeout(() => {
                const finalSteps = [...updatedSteps];
                finalSteps[resultVerificationStep] = {
                  ...finalSteps[resultVerificationStep],
                  details: "所有指令已执行完成，故障已解决"
                };
                setThinkingSteps(finalSteps);
              }, 2000);
            }
          }
            
            return {
              ...prev,
              commands: updatedCommands
            };
          });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("发送指令失败，请重试");
      console.error("指令发送错误:", error);
    } finally {
      setActiveCommand(null);
    }
  };

  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
           <h2 className="text-xl font-bold text-gray-900">智能故障处理</h2>
            <p className="text-sm text-gray-500 mt-1">
              {record ? `处理设备: ${record.equipmentName}` : "智能分析并解决设备故障"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        
        {/* Equipment info and fault data form */}
        {record && !showSolution && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">故障信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  设备信息
                </label>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{record.equipmentName}</h4>
                    <StatusBadge status="error" />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <p className="flex items-center mb-1">
                      <i className="fa-solid fa-id-card mr-1.5"></i>
                      {record.equipmentId} · {record.equipmentType || "未知类型"}
                    </p>
                    <p className="flex items-center">
                      <i className="fa-solid fa-clock mr-1.5"></i>
                      故障发生时间: {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
            {/* 摄像头监控画面 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                设备监控画面
              </label>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <img 
                  src={(() => {
                    // 根据设备类型返回不同的监控画面
                   switch(record?.equipmentType) {
                     case '变压器':
                       return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=electrical%20transformer%20monitoring%20view%2C%20high%20voltage%20equipment%2C%20substation&sign=1db28c5b0d50893fc7aa441a4fd09e8a';
                     case '断路器':
                       return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=high%20voltage%20circuit%20breaker%20monitoring%20view%2C%20electrical%20substation%20equipment&sign=cd93f08396fa1c3988276205d1d694b9';
                     case '互感器':
                       return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=current%20transformer%20monitoring%20view%2C%20electrical%20substation%20equipment&sign=9a298059f044596da81f1a53b69a9369';
                     case '隔离开关':
                       return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=isolating%20switch%20monitoring%20view%2C%20electrical%20substation%20equipment&sign=55061c8ba16a90750b77fbccac9e3935';
                     case '避雷器':
                       return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=lightning%20arrester%20monitoring%20view%2C%20electrical%20substation%20equipment&sign=07376bfe90ba82941b97f2c7a3ff4121';
                     default:
                       return 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=electrical%20equipment%20monitoring%20camera%20view&sign=2132f969a8763f2581c64e2642ac1aad';
                   }
                  })()} 
                  alt={`${record?.equipmentType || '设备'}监控画面`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <i className="fa-solid fa-circle mr-1 animate-pulse"></i>
                  实时监控中
                </div>
              </div>
            </div>
               
               {/* 传感器数据 */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   传感器实时数据
                 </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">温度</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            sensorData?.temperature > 75 ? 'bg-red-100 text-red-800' : 
                            sensorData?.temperature > 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {sensorData?.temperature > 75 ? '异常' : sensorData?.temperature > 60 ? '偏高' : '正常'}
                          </span>
                        </div>
                        <div className="flex items-end mt-1">
                          <span className="text-2xl font-bold text-gray-900">{sensorData?.temperature}</span>
                          <span className="text-gray-500 ml-1 mb-1">°C</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              sensorData?.temperature > 75 ? 'bg-red-500' : 
                              sensorData?.temperature > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(100, (sensorData?.temperature || 0) / 100 * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">电流</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            sensorData?.current > 150 ? 'bg-red-100 text-red-800' : 
                            sensorData?.current > 100 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {sensorData?.current > 150 ? '异常' : sensorData?.current > 100 ? '偏高' : '正常'}
                          </span>
                        </div>
                        <div className="flex items-end mt-1">
                          <span className="text-2xl font-bold text-gray-900">{sensorData?.current}</span>
                          <span className="text-gray-500 ml-1 mb-1">A</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              sensorData?.current > 150 ? 'bg-red-500' : 
                              sensorData?.current > 100 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(100, (sensorData?.current || 0) / 200 * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">电压</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            sensorData?.voltage < 9.5 || sensorData?.voltage > 11.5 ? 'bg-red-100 text-red-800' : 
                            sensorData?.voltage < 10 || sensorData?.voltage > 11 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {sensorData?.voltage < 9.5 || sensorData?.voltage > 11.5 ? '异常' : 
                             sensorData?.voltage < 10 || sensorData?.voltage > 11 ? '波动' : '正常'}
                          </span>
                        </div>
                        <div className="flex items-end mt-1">
                          <span className="text-2xl font-bold text-gray-900">{sensorData?.voltage}</span>
                          <span className="text-gray-500 ml-1 mb-1">kV</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              sensorData?.voltage < 9.5 || sensorData?.voltage > 11.5 ? 'bg-red-500' : 
                              sensorData?.voltage < 10 || sensorData?.voltage > 11 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(100, ((sensorData?.voltage || 0) - 9) / 3 * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">振动</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            sensorData?.vibration > 3.5 ? 'bg-red-100 text-red-800' : 
                            sensorData?.vibration > 2.5 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {sensorData?.vibration > 3.5 ? '异常' : sensorData?.vibration > 2.5 ? '偏高' : '正常'}
                          </span>
                        </div>
                        <div className="flex items-end mt-1">
                          <span className="text-2xl font-bold text-gray-900">{sensorData?.vibration?.toFixed(1)}</span>
                          <span className="text-gray-500 ml-1 mb-1">mm/s</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              sensorData?.vibration > 3.5 ? 'bg-red-500' : 
                              sensorData?.vibration > 2.5 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(100, (sensorData?.vibration || 0) / 5 * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
               </div>
              
              <div className="flex justify-end">
                <button
                  onClick={startAnalysis}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      处理中...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-robot mr-2"></i>
                  AI智能诊断
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Processing Steps */}
        {(showSolution || isProcessing) && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI处理流程</h3>
            
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
              {/* Steps */}
              <div className="space-y-6 relative">
                {thinkingSteps.map((step, index) => (
                  <div key={step.id} className="flex">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center mr-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        step.status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : step.status === 'in_progress' 
                            ? 'bg-blue-500 text-white' 
                            : step.status === 'failed'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.status === 'in_progress' ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : step.status === 'failed' ? (
                          <i className="fa-solid fa-exclamation"></i>
                        ) : (
                          <i className={`fa-solid ${step.icon}`}></i>
                        )}
                      </div>
                    </div>
                  
                    {/* Step content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          step.status === 'completed' ? 'text-green-600' : 
                          step.status === 'in_progress' ? 'text-blue-600' :
                          step.status === 'failed' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h4>
                        {step.status === 'completed' && (
                          <span className="text-xs text-green-500">
                            <i className="fa-solid fa-check mr-1"></i>已完成
                          </span>
                        )}
                        {step.status === 'in_progress' && (
                          <span className="text-xs text-blue-500">
                            <i className="fa-solid fa-spinner fa-spin mr-1"></i>进行中
                          </span>
                        )}
                        {step.status === 'pending' && (
                          <span className="text-xs text-gray-500">
                            <i className="fa-solid fa-clock mr-1"></i>待处理
                          </span>
                        )}
                        {step.status === 'failed' && (
                          <span className="text-xs text-red-500">
                            <i className="fa-solid fa-times mr-1"></i>失败
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      
                      {/* Step details */}
                      {(step.status === 'in_progress' || step.status === 'completed') && step.details && (
                        <div className={`mt-2 p-3 rounded-lg border ${
                          step.status === 'in_progress' 
                            ? 'bg-blue-50 border-blue-100' 
                            : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div className="flex items-start">
                            <i className={`fa-solid ${
                              step.status === 'in_progress' 
                                ? 'fa-robot text-blue-500' 
                                : 'fa-info-circle text-gray-500'
                            } mr-2 mt-0.5`}></i>
                            <p className={`text-sm ${
                              step.status === 'in_progress' 
                                ? 'text-blue-700' 
                                : 'text-gray-700'
                            }`}>{step.details}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* AI Solution */}
        {showSolution && solution && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI解决方案</h3>
            
            <div className="space-y-6">
              {/* Diagnosis */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i className="fa-solid fa-stethoscope text-blue-500 mr-2"></i>
                  故障诊断
                </h4>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-800 whitespace-pre-line">{solution.diagnosis}</p>
                </div>
              </div>
              
              {/* Solution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i className="fa-solid fa-wrench text-green-500 mr-2"></i>
                  解决方案
                </h4>
           <div className="p-4 bg-green-50 rounded-lg border border-green-100 min-h-[160px]">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{solution.solution}</p>
                </div>
              </div>
              
              {/* Commands */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i className="fa-solid fa-terminal text-purple-500 mr-2"></i>
                  执行指令
                </h4>
                <div className="space-y-3">
                  {solution.commands.map((cmd) => (
                    <div key={cmd.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{cmd.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{cmd.id} · {cmd.time}</p>
                          
                          {/* 指令内容 */}
                          {cmd.content && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-x-auto">
                              {cmd.content}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            cmd.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            cmd.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            cmd.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            cmd.status === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {cmd.status === 'sent' ? '已发送' : 
                             cmd.status === 'processing' ? '处理中' : 
                             cmd.status === 'completed' ? '已完成' : 
                             cmd.status === 'failed' ? '失败' : '待发送'}
                          </div>
                          
                          {(cmd.status === 'pending' || cmd.status === 'failed') && (
                            <button
                              onClick={() => sendCommand(cmd.id)}
                              disabled={activeCommand === cmd.id || isProcessing}
                              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                            >
                              {activeCommand === cmd.id ? (
                                <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                              ) : cmd.status === 'failed' ? (
                                <i className="fa-solid fa-redo mr-1"></i>
                              ) : (
                                <i className="fa-solid fa-paper-plane mr-1"></i>
                              )}
                              {activeCommand === cmd.id ? '发送中' : cmd.status === 'failed' ? '重试' : '发送'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
          >
            关闭
          </button>
          
          {showSolution && (
            <button
             onClick={() => {
               if (record?.equipmentId) {
                 // 使用数据库服务恢复设备正常状态
                 db.restoreEquipmentNormalState(record.equipmentId);
                 
                  // 更新告警状态为已完成
                       if (record?.id) {
                         // 直接使用告警ID更新状态
                         const updateSuccess = db.updateAlertStatus(record.id, 'completed');
                         if (updateSuccess) {
                           console.log(`告警 ${record.id} 已标记为完成并从列表中移除`);
                           // 显式通知订阅者数据已变更
                           db.notifyListeners();
                         } else {
                           console.error(`更新告警 ${record.id} 状态失败`);
                         }
                       }
                 
                 // 创建维护记录
                 const newMaintenanceRecord = {
                   equipmentId: record.equipmentId,
                   equipmentName: record.equipmentName,
                   type: 'repair',
                   date: new Date().toISOString().split('T')[0],
                   technician: 'AI自动处理',
                   content: '系统自动处理设备故障，已恢复正常运行',
                   duration: '30分钟'
                 };
                 db.addMaintenanceRecord(newMaintenanceRecord);
                 
                 toast.success(`设备 ${record.equipmentName} 故障处理完成，状态已更新为正常`);
               } else {
                 toast.success('故障处理完成，已生成维护记录');
               }
                onClose();
              }}
              disabled={solution?.commands.some(cmd => cmd.status !== 'completed')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-check mr-2"></i>
              确认完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}