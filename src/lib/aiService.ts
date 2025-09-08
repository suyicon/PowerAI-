import { toast } from 'sonner';
import axios from 'axios';

// 定义AI思考步骤类型
export interface AIThinkingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
}

// 定义AI解决方案类型
export interface AISolution {
  diagnosis: string;
  solution: string;
  commands: Array<{
    id: string;
    name: string;
    status: 'pending' | 'sent' | 'processing' | 'completed' | 'failed';
    time: string;
    content?: string;
  }>;
}

// 定义故障数据类型
export interface FaultData {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  faultTime: string;
  symptoms: string;
  sensorData?: {
    temperature: number;
    current: number;
    voltage: number;
    vibration: number;
    hasVisualAnomaly: boolean;
  };
  currentData?: Record<string, number>;
  historicalData?: Array<Record<string, number>>;
}

// AI服务类 - 模拟1.5b模型交互
export class AIService {
  private apiUrl = 'https://api.example.com/ai/analyze'; // 实际项目中替换为真实API地址
  // 创建思考步骤数组的方法，确保每个设备分析都有独立的步骤实例
  private createThinkingSteps(): AIThinkingStep[] {
    return [
      {
        id: 1,
        title: "数据收集",
        description: "正在收集设备故障数据和历史记录",
        icon: "fa-database",
        status: "pending"
      },
      {
        id: 2,
        title: "故障分析",
        description: "分析故障特征和可能原因",
        icon: "fa-search",
        status: "pending"
      },
      {
        id: 3,
        title: "解决方案生成",
        description: "基于历史数据和知识库生成解决方案",
        icon: "fa-lightbulb",
        status: "pending"
      },
      {
        id: 4,
        title: "指令发送",
        description: "向设备发送修复指令",
        icon: "fa-send",
        status: "pending"
      },
      {
        id: 5,
        title: "结果验证",
        description: "验证故障是否已解决",
        icon: "fa-check-circle",
        status: "pending"
      }
    ];
  }

  // 获取初始思考步骤
  // 确保返回的初始步骤状态都是"pending"
  // 获取初始思考步骤
  getInitialThinkingSteps(): AIThinkingStep[] {
    return this.createThinkingSteps();
  }

  // 分析故障 - 模拟调用1.5b模型
  async analyzeFault(faultData: FaultData, onStepUpdate: (steps: AIThinkingStep[]) => void): Promise<AISolution> {
    return new Promise((resolve, reject) => {
      // 为每个分析创建独立的思考步骤数组，避免共享状态
      const thinkingSteps = this.createThinkingSteps();
      
      // 模拟网络请求延迟
      setTimeout(() => {
        // 模拟AI思考过程
        let stepIndex = 0;
        const interval = setInterval(() => {
          if (stepIndex < thinkingSteps.length) {
            // 更新当前步骤状态（操作本地数组，不会影响其他设备）
            thinkingSteps[stepIndex].status = "in_progress";
         thinkingSteps[stepIndex].details = this.getStepDetails(thinkingSteps[stepIndex].id, faultData, thinkingSteps[stepIndex].status);
            
            onStepUpdate([...thinkingSteps]);
            
            // 模拟步骤完成
            setTimeout(() => {
          thinkingSteps[stepIndex].status = "completed";
          
          // 结果验证步骤需要等待所有指令发送完成后才能标记为完成
          const isResultVerificationStep = thinkingSteps[stepIndex].title === "结果验证";
          if (!isResultVerificationStep) {
            onStepUpdate([...thinkingSteps]);
          } else {
            // 保持结果验证步骤为"pending"状态，直到所有指令发送完成
            thinkingSteps[stepIndex].status = "pending";
            thinkingSteps[stepIndex].details = "等待指令发送完成...";
            onStepUpdate([...thinkingSteps]);
          }
          
          stepIndex++;
          
          // 如果是最后一步，返回结果
          if (stepIndex === thinkingSteps.length) {
                clearInterval(interval);
                resolve(this.generateSolution(faultData));
              }
            }, 2000);
          }
        }, 3000);
      }, 1000);
    });
  }

  // 发送指令到设备
  async sendCommand(commandId: string, equipmentId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      // 模拟指令发送延迟
      setTimeout(() => {
        // 模拟5%的失败率
        if (Math.random() < 0.05) {
          resolve({ success: false, message: "指令发送失败，请重试" });
        } else {
          // 存储特定设备的指令状态
          if (!localStorage.getItem('deviceCommands')) {
            localStorage.setItem('deviceCommands', JSON.stringify({}));
          }
          
          const commands = JSON.parse(localStorage.getItem('deviceCommands') || '{}');
          if (!commands[equipmentId]) {
            commands[equipmentId] = [];
          }
          
          commands[equipmentId].push({
            commandId,
            status: 'completed',
            timestamp: new Date().toISOString()
          });
          
          localStorage.setItem('deviceCommands', JSON.stringify(commands));
          resolve({ success: true, message: "指令已成功发送" });
        }
      }, 1500);
    });
  }

  // 生成模拟解决方案 - 实际项目中由1.5b模型返回
     private generateSolution(faultData: FaultData): AISolution {
    // 根据传感器数据、设备类型和故障原因生成详细解决方案
    let diagnosis = "";
    let solution = "";
    const { sensorData } = faultData;
    
    // 温度异常故障
    if (sensorData && sensorData.temperature > 75) {
      diagnosis = `设备温度异常升高(${sensorData.temperature}°C)，超过安全阈值。`;
      
       // 根据设备类型生成针对性解决方案
      switch (faultData.equipmentType) {
        case "变压器":
          solution = "检查变压器触头是否氧化或烧蚀\n清理散热通道，确保通风良好\n测量接触电阻，确保在正常范围内(<20μΩ)\n检查操作机构润滑油是否老化，必要时更换\n若温度超过90°C，立即申请停运检修\n测试操作机构响应时间，确保符合标准\n检查灭弧室压力或SF6气体密度\n对机械传动部分进行润滑和紧固\n进行分合闸线圈直流电阻测试\n检查辅助回路绝缘电阻";
          break;
        case "隔离开关":
          solution = "检查触头接触是否良好，有无过热痕迹\n清理绝缘子表面污秽，检查有无裂纹\n测量回路电阻，确保符合要求\n检查操作机构是否灵活，有无卡涩\n对转动部分进行润滑处理\n检查接地刀闸与主刀闸的机械闭锁关系\n测试电动操作机构的动作电压范围\n检查辅助开关切换是否准确可靠\n调整触头压力和插入深度\n进行分合闸操作试验，检查同期性";
          break;
        case "互感器":
          solution = "检查本体有无渗漏油现象\n测量绕组绝缘电阻和介损值\n检查二次回路接地是否可靠\n测试误差特性，确保符合精度要求\n检查膨胀器或油位计指示是否正常\n清理套管表面污秽，检查有无破损\n检查一次接线端子有无过热痕迹\n紧固二次接线，确保接触良好\n进行极性测试，确认接线正确\n必要时进行变比试验和伏安特性试验";
          break;
        case "避雷器":
          solution = "检查避雷器本体有无破损或渗漏\n测量泄漏电流，确保在正常范围\n检查计数器动作是否正常\n清理瓷套表面污秽，检查有无裂纹\n检查底座绝缘电阻\n检查引线连接是否牢固，有无过热\n测试脱离器动作特性\n检查接地引下线是否完好\n核对铭牌参数与运行要求是否一致\n根据运行年限和试验结果决定是否更换";
          break;
        default:
          solution = "检查设备散热系统是否正常工作\n清理散热片灰尘和杂物，确保通风良好\n检查相关传感器和连接线路\n监控温度变化趋势，建立每小时记录机制\n进行必要的电气和机械性能测试\n分析历史数据，确定故障发展趋势\n根据测试结果制定维修方案\n更换故障组件并进行功能验证\n进行整体性能测试，确保符合标准\n制定预防措施，防止类似故障再次发生";
      }
    }
    
    // 电流异常故障处理
    if (sensorData && sensorData.current > 150) {
      diagnosis += diagnosis ? " " : "";
      diagnosis += `电流异常(${sensorData.current}A)，超出额定值。`;
      
      // 根据设备类型添加针对性电流异常处理步骤
      switch (faultData.equipmentType) {
        case "变压器":
          solution += "\n\n检查三相负荷是否平衡\n进行绕组直流电阻测试\n检查分接开关接触是否良好\n分析过流原因，采取限负荷措施\n必要时进行短路阻抗测试";
          break;
        case "断路器":
          solution += "\n\n远程发送分闸指令，切断故障电流\n检查断路器灭弧室是否损坏\n分析故障电流波形，确定故障类型\n检查操作机构储能情况\n测试脱扣器动作特性";
          break;
        case "互感器":
          solution += "\n\n检查一次侧是否过负荷\n测试二次回路有无短路\n检查铁芯是否过热\n分析过流原因，采取相应措施\n必要时进行动稳定和热稳定校验";
          break;
        default:
          solution += "\n\n检查是否存在过负荷情况\n分析过流原因，采取相应措施\n检查保护装置动作情况\n测试相关电流互感器准确性\n必要时进行设备参数测试和校核";
      }
    }
    
    // 电压异常故障处理
    if (sensorData && (sensorData.voltage < 9.5 || sensorData.voltage > 11.5)) {
      diagnosis += diagnosis ? " " : "";
      diagnosis += `电压异常(${sensorData.voltage}kV)，超出正常范围。`;
      
      // 根据设备类型添加针对性电压异常处理步骤
      solution += solution ? "\n\n" : "";
      switch (faultData.equipmentType) {
        case "变压器":
          solution += "检查分接开关位置是否正确\n测试有载分接开关动作是否正常\n检查调压装置工作状态\n分析电压异常原因，联系调度调整\n必要时进行变比测试和组别检查";
          break;
        case "互感器":
          solution += "检查一次侧熔断器是否完好\n检查二次回路有无开路或短路\n测试仪表电压回路是否正常\n检查接地方式是否正确\n进行电压比测试，确认变比准确";
          break;
        default:
           solution += "检查电压调节装置是否正常工作\n测量三相电压平衡度，确保偏差在允许范围内\n检查中性点接地系统是否完好\n分析电压波动原因，判断是系统问题还是设备故障\n必要时联系调度调整系统电压";
      }
    }
    
    // 振动异常故障处理
    if (sensorData && sensorData.vibration > 3.5) {
      diagnosis += diagnosis ? " " : "";
      diagnosis += `振动异常(${sensorData.vibration}mm/s)，可能存在机械故障。`;
      
      solution += solution ? "\n\n" : "";
      switch (faultData.equipmentType) {
        case "变压器":
          solution += "进行振动频谱分析，确定故障频率成分\n检查铁芯是否松动或多点接地\n检查绕组压紧情况\n检查冷却风扇和油泵运行状态\n测试分接开关有无接触不良";
          break;
        case "断路器":
          solution += "检查操作机构有无松动部件\n测试合闸弹簧储能情况\n检查分闸缓冲器性能\n紧固底座和固定螺栓\n检查灭弧室有无松动";
          break;
        default:
          solution += "进行振动频谱分析，确定故障频率成分\n检查轴承和旋转部件磨损情况\n紧固松动的连接螺栓和部件\n检查设备基础是否沉降或损坏\n必要时进行动平衡校正或更换磨损部件";
      }
    }
    
    // 视觉异常故障处理
    if (sensorData && sensorData.hasVisualAnomaly) {
      diagnosis += diagnosis ? " " : "";
      diagnosis += "摄像头检测到设备外观异常。";
      
      solution += solution ? "\n\n" : "";
      switch (faultData.equipmentType) {
        case "变压器":
          solution += "检查油位是否正常，有无渗漏油\n检查套管有无破损或裂纹\n检查散热器有无变形或堵塞\n确认瓦斯继电器有无气体\n检查接地装置是否完好";
          break;
        case "断路器":
          solution += "检查瓷套或外壳有无破损\n确认SF6气体压力表指示是否正常\n检查操作机构有无漏油\n检查接线端子有无过热变色\n确认计数器指示是否正常";
          break;
        default:
          solution += "安排技术人员现场检查设备外观异常情况\n重点检查绝缘子是否有裂纹或污秽\n检查连接部位是否有过热变色痕迹\n确认设备标识和安全警示是否清晰完整\n根据检查结果进行清洁、紧固或更换部件";
      }
    }
    
    // 无传感器数据时的故障处理
    if (!sensorData) {
      switch (faultData.equipmentType) {
        case "变压器":
          diagnosis = "变压器综合故障特征分析显示可能存在内部异常，需紧急处理。";
          solution = "立即降低变压器负载至30%额定容量\n密切监控温度和瓦斯继电器状态\n启动全部冷却系统，增强散热\n进行油色谱分析，检测特征气体含量\n测量绕组直流电阻和变比\n检查套管绝缘状况\n测试铁芯绝缘电阻\n检查有载分接开关运行状态\n根据试验结果决定是否紧急停运\n若确认内部故障，立即申请停电检修";
          break;
        case "断路器":
          diagnosis = "断路器操作机构故障，可能是由于机械部件磨损或液压系统压力不足导致的分闸操作失败。";
          solution = "远程发送分闸指令，尝试紧急操作\n检查液压系统压力是否在正常范围\n测试操作机构响应时间，确保符合标准\n若失败，派遣技术人员现场检查机械部件\n更换磨损的连杆和轴承\n重新校准操作机构行程和同期性\n检查合闸弹簧状态\n测试分合闸线圈电阻\n检查辅助开关切换情况\n进行机械特性试验，确认参数正常";
          break;
        case "隔离开关":
          diagnosis = "隔离开关操作故障，可能是由于操作机构卡涩或触头接触不良导致。";
          solution = "检查操作机构是否有异物卡涩\n对传动部分进行润滑处理\n检查操作电源是否正常\n测试电机正反转和限位开关\n检查机械闭锁是否解除\n若远程操作失败，尝试手动操作\n检查触头是否氧化或变形\n调整触头压力和插入深度\n紧固松动的连接螺栓\n进行分合闸操作试验，确认正常";
          break;
        case "互感器":
          diagnosis = "互感器二次回路异常，可能导致保护和测量系统失效。";
          solution = "检查二次回路有无开路或短路\n测量二次绕组绝缘电阻\n检查端子排连接是否紧固\n测试熔断器或空气开关状态\n检查接地回路是否可靠\n确认仪表和保护装置工作正常\n检查极性连接是否正确\n进行变比测试，确认变比准确\n检查外壳接地是否良好\n必要时更换故障互感器";
          break;
        case "避雷器":
          diagnosis = "避雷器泄漏电流异常，可能导致过电压保护失效。";
          solution = "测量避雷器泄漏电流和阻性分量\n检查计数器动作情况\n测试脱离器性能\n检查瓷套有无破损或污秽\n确认接地引下线连接可靠\n检查底座绝缘状况\n对比历史数据，分析变化趋势\n若超标，申请停运更换\n更换前做好安全措施\n新设备投运前进行交接试验";
          break;
        default:
          diagnosis = "设备故障特征分析显示可能存在内部组件故障，需要进一步检查。";
           solution = "进行全面的设备检查\n检查传感器连接和校准状态\n分析历史数据，确定异常趋势\n进行必要的电气和机械性能测试\n根据测试结果制定维修方案\n更换故障组件并进行功能验证\n进行整体性能测试，确保符合标准\n分析故障原因，制定预防措施\n更新设备健康档案\n加强状态监测，防止故障再次发生";
      }
    }
    
    // 确保解决方案不为空
    if (!solution) {
           solution = "进行全面的设备检查\n检查传感器连接和校准状态\n分析历史运行数据，确定异常趋势\n进行必要的电气和机械测试\n根据测试结果制定维修计划\n实施维修并验证设备功能";
    }
     
     return {
      diagnosis,
      solution,
      commands: [
        { 
          id: `CMD-${Date.now()}-1`, 
          name: "紧急分闸指令", 
          status: "pending", 
          time: new Date().toLocaleTimeString(),
          content: "DEVICE_CONTROL;OPERATION=TRIP;PRIORITY=EMERGENCY"
        },
        { 
          id: `CMD-${Date.now()}-2`, 
          name: "状态检测指令", 
          status: "pending", 
          time: new Date().toLocaleTimeString(),
          content: "DEVICE_DIAGNOSIS;LEVEL=DETAILED;PARAMS=TEMP,PRESSURE,CURRENT"
        },
        { 
          id: `CMD-${Date.now()}-3`, 
          name: "系统复位指令", 
          status: "pending", 
          time: new Date().toLocaleTimeString(),
          content: "SYSTEM_RESET;DELAY=10;AUTO_RECOVER=TRUE"
        }
      ]
    };
  }

   // 获取步骤详情
  private getStepDetails(stepId: number, faultData: FaultData, status: 'pending' | 'in_progress' | 'completed' | 'failed'): string {
    switch(stepId) {
      case 1:
        if (faultData.sensorData) {
          return `已通过传感器收集设备${faultData.equipmentName}的实时数据：温度${faultData.sensorData.temperature}°C，电流${faultData.sensorData.current}A，电压${faultData.sensorData.voltage}kV，振动${faultData.sensorData.vibration}mm/s。${faultData.sensorData.hasVisualAnomaly ? '摄像头检测到设备外观异常。' : ''}`;
        }
        return `已收集设备${faultData.equipmentName}(${faultData.equipmentId})的故障数据，包括故障时间${faultData.faultTime}`;
      case 2:
        if (status === 'completed') {
          return "已完成故障分析，识别出主要故障原因：设备温度异常升高导致断路器跳闸，电流中断。";
        }
        return "正在分析传感器数据特征，识别异常模式并匹配历史故障案例";
      case 3:
        if (status === 'completed') {
          return "已生成解决方案：建议远程发送分闸指令，检查冷却系统，降低负载并安排技术人员现场检修。";
        }
        return "基于传感器数据分析结果生成初步解决方案，正在评估可行性和风险";
      case 4:
        if (status === 'completed') {
          return "已成功发送控制指令，设备已执行分闸操作，进入安全状态。";
        }
        return "正在准备控制指令，将根据解决方案分步骤发送";
      case 5:
        if (status === 'completed') {
          return "故障已解决，设备状态恢复正常，温度已降至安全范围。";
        }
        return "正在验证设备状态，确认故障是否已解决";
      default:
        return "";
    }
  }
  // 获取专家响应 - 调用真实的doubao-1.5-thinking-vision-pro API
  async getExpertResponse(userQuery: string, systemPrompt: string, ragData: any): Promise<string> {
    // 构建API请求参数
     const requestData = {
  model: "qwen-flash",
  messages: [
    { role: "system", content: systemPrompt },
    { 
      role: "system", 
      content: `以下是电力系统的相关数据，请基于这些数据回答用户问题：
                 设备状态: ${JSON.stringify(ragData.equipmentStatus)}
                 告警历史: ${JSON.stringify(ragData.alertHistory)}
                 系统指标: ${JSON.stringify(ragData.systemMetrics)}
                 输电系统数据: ${JSON.stringify(ragData.transmissionData)}`
    },
    { role: "user", content: userQuery }
  ],
  temperature: 0.7,
  max_tokens: 1000
};
    
    try {
      // 调用真实API
      const response = await axios.post(
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer sk-c6d578db48e744988e0d70b5e3990403`
          }
        }
      );
      
      // 返回AI响应内容
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling doubao API:", error);
      throw new Error("Failed to get AI expert response");
    }
  }
}

// 创建AI服务实例
export const aiService = new AIService();