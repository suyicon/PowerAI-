import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aiService } from '@/lib/aiService';
import { db } from '@/lib/db';

// 定义消息类型
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// 定义RAG数据类型
interface RAGData {
  equipmentStatus: any[];
  alertHistory: any[];
  maintenanceRecords: any[];
  systemMetrics: any;
}

export default function AIExpertChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
 const [isLoading, setIsLoading] = useState(false);
  const [ragData, setRagData] = useState<RAGData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 预设系统提示词
  const systemPrompt = `你是一位名叫瓦特同学的电力系统AI专家，负责分析电力设备状态、诊断故障和提供维护建议。
  基于提供的实时数据和历史记录，你需要给出专业、准确且可操作的建议。
  回答应简洁明了，重点突出，必要时使用技术术语但需给出解释。
  当分析故障时，请提供可能原因、风险评估和解决方案。`;

  // 加载RAG数据
  useEffect(() => {
    const loadRAGData = async () => {
      try {
         // 从数据库获取实时数据
         const equipment = db.getEquipment();
         const alerts = db.getAlerts();
         const maintenance = db.getMaintenanceRecords();
         const substations = db.getSubstations();
         
         // 计算系统指标
         const totalEquipment = equipment.length;
         const normalEquipment = equipment.filter(eq => eq.status === 'normal').length;
         const warningEquipment = equipment.filter(eq => eq.status === 'warning').length;
         const errorEquipment = equipment.filter(eq => eq.status === 'error').length;
         
         const normalRate = totalEquipment > 0 ? Math.round((normalEquipment / totalEquipment) * 100) : 0;
         const warningRate = totalEquipment > 0 ? Math.round((warningEquipment / totalEquipment) * 100) : 0;
         const errorRate = totalEquipment > 0 ? Math.round((errorEquipment / totalEquipment) * 100) : 0;
         const averageLoad = equipment.length > 0 
           ? equipment.reduce((sum, eq) => sum + eq.load, 0) / equipment.length 
           : 0;
         
         // 构建RAG数据
         const ragData: RAGData = {
           equipmentStatus: equipment.map(eq => ({
             id: eq.id,
             name: eq.name,
             status: eq.status === 'normal' ? '正常' : eq.status === 'warning' ? '警告' : '故障',
             temperature: eq.temperature,
             load: eq.load,
             type: eq.type
           })),
           alertHistory: alerts,
           maintenanceRecords: maintenance.map(record => ({
             id: record.id,
             equipmentId: record.equipmentId,
             date: record.date,
             type: record.type === 'preventive' ? '预防性维护' : 
                   record.type === 'inspection' ? '定期检查' : '故障维修',
             content: record.content
           })),
           systemMetrics: {
             totalEquipment,
             normalRate,
             warningRate,
             errorRate,
             averageLoad: parseFloat(averageLoad.toFixed(1)),
             totalSubstations: substations.length
           }
         };
         
         setRagData(ragData);
        
        // 添加初始欢迎消息
        setMessages([{
          id: 'welcome',
           content: '您好！我是瓦特同学。我可以帮助您分析设备状态、诊断故障和提供维护建议。有什么我可以帮助您的吗？',
          role: 'assistant',
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Failed to load RAG data:', error);
        toast.error('加载系统数据失败，请刷新页面重试');
      }
    };
    
    loadRAGData();
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !ragData) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // 调用AI服务获取响应
      const response = await aiService.getExpertResponse(
        userMessage.content,
        systemPrompt,
        ragData
      );
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('获取AI响应失败，请重试');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: '抱歉，我无法处理您的请求。请稍后重试或检查系统连接。',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };





  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
           <i className="fa-solid fa-robot text-blue-500 mr-2"></i>
           瓦特同学
        </h3>

      </div>
      <p className="text-xs text-gray-500 mt-1 ml-4 mb-3">基于实时数据提供专业分析和建议</p>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              message.role === 'user' 
                ? 'flex items-end justify-end' 
                : 'flex items-start'
            }`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <i className="fa-solid fa-robot text-blue-600"></i>
                </div>
              )}
              <div className={`
                p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }
              `}>
            <div className="text-sm whitespace-pre-line">{message.content}</div>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <i className="fa-solid fa-robot text-blue-600"></i>
            </div>
            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg rounded-bl-none max-w-[80%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题或指令..."
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            rows={3}
            disabled={isLoading || !ragData}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !ragData}
            className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>

      </div>
    </div>
  );
}