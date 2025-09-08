import { toast } from 'sonner';

// 定义变电站数据接口
export interface Substation {
  id: string;
  name: string;
  location: string;
  capacity: string;
  status: 'normal' | 'warning' | 'error';
  imageUrl: string;
  equipmentIds: string[]; // 关联的设备ID列表
}

// 定义设备数据接口
export interface Equipment {
  id: string;
  name: string;
  type: string;
  substationId: string;
  location: string;
  status: 'normal' | 'warning' | 'error';
  temperature: number;
  voltage: number;
  current: number;
  load: number;
  lastMaintenance: string;
  nextMaintenance: string;
  imageUrl: string;
  specifications: Record<string, string>;
}

// 定义告警数据接口
export interface Alert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  substationId: string;
  substationName: string;
  message: string;
  level: 'warning' | 'error';
  time: string;
  status: 'pending' | 'processing' | 'completed';
}

// 定义维护记录接口
export interface Maintenance {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'inspection' | 'repair';
  date: string;
  technician: string;
  content: string;
  duration: string;
}

// 数据库结构接口
interface Database {
  substations: Record<string, Substation>;
  equipment: Record<string, Equipment>;
  alerts: Alert[];
  maintenance: Maintenance[];
}

// 初始化默认变电站数据
const defaultSubstations: Substation[] = [
  {
    id: 'SUB-001',
    name: '城北变电站',
    location: '城市北部工业区',
    capacity: '110kV',
    status: 'normal',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=electric%20substation%20exterior%20view&sign=1627a047dbba405a43d9775501983dbd',
    equipmentIds: []
  },
  {
    id: 'SUB-002',
    name: '城南变电站',
    location: '城市南部居民区',
    capacity: '220kV',
    status: 'normal',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=modern%20electric%20substation&sign=195d6b12dc7ca5a31c033e001db61d8f',
    equipmentIds: []
  },
  {
    id: 'SUB-003',
    name: '城东变电站',
    location: '城市东部科技园区',
    capacity: '110kV',
    status: 'warning',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=industrial%20electric%20substation&sign=e6c0c46b53a070f8aa340a8eb5688adf',
    equipmentIds: []
  }
];

// 初始化默认设备数据
const defaultEquipment: Equipment[] = [
  // 城北变电站设备
  {
    id: 'EQ-2023-001',
    name: '主变压器 T1',
    type: '变压器',
    substationId: 'SUB-001',
    location: '1号柜',
    status: 'normal',
    temperature: 45,
    voltage: 10.5,
    current: 42,
    load: 65,
  lastMaintenance: '2025-05-12',
  nextMaintenance: '2025-08-12',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=power%20transformer%20equipment%20in%20substation&sign=6f183df66973ddf0db9506e4d37280d1',
    specifications: {
      '额定容量': '1000 kVA',
      '一次电压': '10 kV',
      '二次电压': '0.4 kV',
      '联结组标号': 'Dyn11',
      '冷却方式': 'ONAN',
      '阻抗电压': '4%'
    }
  },
  {
    id: 'EQ-2023-003',
    name: '隔离开关 DS-18',
    type: '隔离开关',
    substationId: 'SUB-001',
    location: '5号柜',
    status: 'normal',
    temperature: 32,
    voltage: 10.2,
    current: 38,
    load: 45,
  lastMaintenance: '2025-05-20',
  nextMaintenance: '2025-08-20',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=electrical%20isolator%20switch&sign=cc4762890f9004f33b0f9da155736a84',
    specifications: {
      '额定电压': '12 kV',
      '额定电流': '630 A',
      '短路耐受电流': '20 kA',
      '操作方式': '手动/电动',
      '绝缘等级': '30 kV'
    }
  },
  
  // 城南变电站设备
  {
    id: 'EQ-2023-002',
    name: '断路器 CB-24',
    type: '断路器',
    substationId: 'SUB-002',
    location: '3号柜',
    status: 'error',
    temperature: 78,
    voltage: 10.1,
    current: 0,
    load: 0,
  lastMaintenance: '2025-04-28',
  nextMaintenance: '2025-07-28',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=high%20voltage%20circuit%20breaker&sign=7e7dd434c96b14f43435db44877b4adc',
    specifications: {
      '额定电压': '12 kV',
      '额定电流': '630 A',
      '额定开断电流': '20 kA',
      '操作机构': '弹簧操作',
      '绝缘等级': '30 kV'
    }
  },
  {
    id: 'EQ-2023-005',
    name: '避雷器 LA-12',
    type: '避雷器',
    substationId: 'SUB-002',
    location: '7号柜',
    status: 'normal',
    temperature: 41,
    voltage: 10.3,
    current: 32,
    load: 58,
  lastMaintenance: '2025-06-02',
  nextMaintenance: '2025-09-02',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=surge%20arrester%20equipment&sign=8831ddd663d43f5259d271074ba9f394',
    specifications: {
      '额定电压': '10 kV',
      '持续运行电压': '8.6 kV',
      '残压': '26 kV',
      '响应时间': '<100ns',
      '温度范围': '-40℃ ~ 70℃'
    }
  },
  
  // 城东变电站设备
  {
    id: 'EQ-2023-004',
    name: '电流互感器 CT-09',
    type: '互感器',
    substationId: 'SUB-003',
    location: '2号柜',
    status: 'warning',
    temperature: 65,
    voltage: 10.4,
    current: 78,
    load: 78,
  lastMaintenance: '2025-05-05',
  nextMaintenance: '2025-08-05',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=current%20transformer%20equipment&sign=8051a85fcbec1e81cf7415ecc82fe057',
    specifications: {
      '额定电压': '10 kV',
      '额定电流比': '600/5 A',
      '准确级': '0.5',
      '额定负荷': '10 VA',
      '温度范围': '-40℃ ~ 70℃'
    }
  }
];

// 创建告警数据 - 为每个符合条件的设备生成告警
const createAlertForDevice = (equipment: Equipment, index: number): Alert => {
  // 获取变电站信息
  const substation = defaultSubstations.find(s => s.id === equipment.substationId);
  
  // 根据设备状态确定告警级别
  const alertLevel = equipment.status === 'error' ? 'error' : 'warning';
  
  // 生成不同的时间戳，模拟告警发生时间
  const baseDate = new Date();
  baseDate.setHours(10 - index);
  baseDate.setMinutes(30);
  const formattedTime = baseDate.toISOString().slice(0, 16).replace('T', ' ');
  
  return {
    id: `A${Date.now().toString().slice(-6)}${index}`,
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    equipmentType: equipment.type,
    substationId: equipment.substationId,
    substationName: substation ? substation.name : '未知变电站',
    message: alertLevel === 'error' ? '设备故障' : '设备状态异常',
    level: alertLevel,
    time: formattedTime,
    status: 'pending'
  };
};

// 获取所有状态为error或warning的设备
const eligibleEquipment = defaultEquipment.filter(
  eq => eq.status === 'error' || eq.status === 'warning'
);

// 为每个符合条件的设备创建告警
const defaultAlerts: Alert[] = eligibleEquipment.map((equipment, index) => 
  createAlertForDevice(equipment, index)
);

// 初始化默认维护记录
const defaultMaintenance: Maintenance[] = [
  {
    id: 'M-2023-001',
    equipmentId: 'EQ-2023-001',
    equipmentName: '主变压器 T1',
    type: 'preventive',
  date: '2025-05-12',
  technician: '张工',
    content: '常规检查和油样分析，设备运行正常',
    duration: '2小时30分钟'
  },
  {
    id: 'M-2023-002',
    equipmentId: 'EQ-2023-003',
    equipmentName: '隔离开关 DS-18',
    type: 'inspection',
  date: '2025-05-20',
  technician: '李工',
    content: '操作机构检查和润滑，机械特性测试',
    duration: '1小时45分钟'
  }
];

// 数据库服务类
export class DBService {
  private static instance: DBService;
  private dbName = 'powerSystemDB';
  private listeners: (() => void)[] = [];

  private constructor() {
    // 初始化数据库
    this.initDB();
  }

  // 单例模式获取数据库实例
  public static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  // 初始化数据库
  private initDB(): void {
    // 初始化数据库
    const existingDB = localStorage.getItem(this.dbName);
    
    // 强制重新初始化数据库以修复可能的数据损坏
    // if (!existingDB) {
      // 将设备ID添加到对应的变电站
      const substationsWithEquipment = [...defaultSubstations];
      defaultEquipment.forEach(equipment => {
        const substationIndex = substationsWithEquipment.findIndex(
          sub => sub.id === equipment.substationId
        );
        if (substationIndex !== -1) {
          substationsWithEquipment[substationIndex].equipmentIds.push(equipment.id);
        } else {
          console.warn(`Substation with ID ${equipment.substationId} not found for equipment ${equipment.id}`);
        }
      });

      const initialDB: Database = {
        substations: substationsWithEquipment.reduce((acc, sub) => {
          acc[sub.id] = sub;
          return acc;
        }, {} as Record<string, Substation>),
        equipment: defaultEquipment.reduce((acc, eq) => {
          acc[eq.id] = eq;
          return acc;
        }, {} as Record<string, Equipment>),
        alerts: defaultAlerts,
        maintenance: defaultMaintenance
      };

      localStorage.setItem(this.dbName, JSON.stringify(initialDB));
    // }
  }

  // 获取整个数据库
  private getDB(): Database {
    const dbStr = localStorage.getItem(this.dbName);
    if (!dbStr) {
      this.initDB();
      return this.getDB();
    }
    return JSON.parse(dbStr);
  }

  // 保存数据库
  private saveDB(db: Database): void {
    localStorage.setItem(this.dbName, JSON.stringify(db));
    this.notifyListeners();
  }

  // 注册数据变更监听器
  public subscribe(listener: () => void): void {
    this.listeners.push(listener);
  }

  // 移除数据变更监听器
  public unsubscribe(listener: () => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 通知所有监听器数据已变更
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // ============== 变电站相关方法 ==============

  // 获取所有变电站
  public getSubstations(): Substation[] {
    const db = this.getDB();
    return Object.values(db.substations);
  }

  // 获取单个变电站
  public getSubstation(id: string): Substation | null {
    const db = this.getDB();
    return db.substations[id] || null;
  }

  // 添加变电站
  public addSubstation(substation: Omit<Substation, 'id' | 'equipmentIds'>): Substation {
    const db = this.getDB();
    const id = `SUB-${Date.now().toString().slice(-6)}`;
    const newSubstation: Substation = {
      ...substation,
      id,
      equipmentIds: []
    };
    
    db.substations[id] = newSubstation;
    this.saveDB(db);
    toast.success(`已添加变电站: ${newSubstation.name}`);
    return newSubstation;
  }

  // 更新变电站
  public updateSubstation(id: string, data: Partial<Substation>): boolean {
    const db = this.getDB();
    if (!db.substations[id]) return false;
    
    db.substations[id] = { ...db.substations[id], ...data };
    this.saveDB(db);
    return true;
  }

  // 删除变电站
  public deleteSubstation(id: string): boolean {
    const db = this.getDB();
    if (!db.substations[id]) return false;
    
    // 删除关联的设备
    db.substations[id].equipmentIds.forEach(eqId => {
      delete db.equipment[eqId];
    });
    
    delete db.substations[id];
    this.saveDB(db);
    toast.success(`已删除变电站`);
    return true;
  }

  // ============== 设备相关方法 ==============

  // 获取所有设备
  public getEquipment(): Equipment[] {
    const db = this.getDB();
    return Object.values(db.equipment);
  }

  // 获取单个设备
  public getEquipmentById(id: string): Equipment | null {
    const db = this.getDB();
    return db.equipment[id] || null;
  }

  // 获取变电站下的所有设备
  public getEquipmentBySubstation(substationId: string): Equipment[] {
    const db = this.getDB();
    return Object.values(db.equipment).filter(eq => eq.substationId === substationId);
  }

  // 添加设备
  public addEquipment(equipment: Omit<Equipment, 'id'>): Equipment {
    const db = this.getDB();
    const id = `EQ-${Date.now().toString().slice(-8)}`;
    const newEquipment: Equipment = {
      ...equipment,
      id
    };
    
    db.equipment[id] = newEquipment;
    
    // 将设备ID添加到变电站
    if (db.substations[equipment.substationId]) {
      db.substations[equipment.substationId].equipmentIds.push(id);
    }
    
    this.saveDB(db);
    toast.success(`已添加设备: ${newEquipment.name}`);
    return newEquipment;
  }

  // 更新设备
  public updateEquipment(id: string, data: Partial<Equipment>): boolean {
    const db = this.getDB();
    if (!db.equipment[id]) return false;
    
    const oldStatus = db.equipment[id].status;
    db.equipment[id] = { ...db.equipment[id], ...data };
    
    // 如果状态变更，更新变电站状态
    if (data.status && data.status !== oldStatus) {
      this.updateSubstationStatus(db.equipment[id].substationId);
    }
    
    this.saveDB(db);
    return true;
  }

  // 删除设备
  public deleteEquipment(id: string): boolean {
    const db = this.getDB();
    if (!db.equipment[id]) return false;
    
    const substationId = db.equipment[id].substationId;
    
    // 从变电站中移除设备ID
    if (db.substations[substationId]) {
      db.substations[substationId].equipmentIds = db.substations[substationId].equipmentIds.filter(
        eqId => eqId !== id
      );
      this.updateSubstationStatus(substationId);
    }
    
    // 删除设备相关的告警
    db.alerts = db.alerts.filter(alert => alert.equipmentId !== id);
    
    delete db.equipment[id];
    this.saveDB(db);
    toast.success(`已删除设备`);
    return true;
  }

  // 根据设备状态更新变电站状态
  private updateSubstationStatus(substationId: string): void {
    const db = this.getDB();
    const substation = db.substations[substationId];
    if (!substation) return;
    
    // 获取变电站所有设备
    const equipment = substation.equipmentIds.map(id => db.equipment[id]).filter(Boolean);
    
    // 确定变电站状态
    let newStatus: 'normal' | 'warning' | 'error' = 'normal';
    
    // 优先检查是否有故障设备
    const hasErrorEquipment = equipment.some(eq => eq.status === 'error');
    if (hasErrorEquipment) {
      newStatus = 'error';
    } else {
      // 检查是否有警告设备
      const hasWarningEquipment = equipment.some(eq => eq.status === 'warning');
      newStatus = hasWarningEquipment ? 'warning' : 'normal';
    }
    
    // 调试日志：记录变电站状态变更
    console.log(`Substation ${substation.id} status changed to ${newStatus}`);
    
    if (substation.status !== newStatus) {
      substation.status = newStatus;
    }
  }

  // 恢复设备正常状态和参数
  public restoreEquipmentNormalState(equipmentId: string): boolean {
    const db = this.getDB();
    const equipment = db.equipment[equipmentId];
    if (!equipment) return false;
    
    // 根据设备类型设置正常参数范围
    let normalTemp = 0;
    let normalCurrent = 0;
    let normalLoad = 0;
    
    switch (equipment.type) {
      case '变压器':
        normalTemp = Math.floor(Math.random() * 15) + 35; // 35-50°C
        normalCurrent = Math.floor(Math.random() * 20) + 40; // 40-60A
        normalLoad = Math.floor(Math.random() * 20) + 50; // 50-70%
        break;
      case '断路器':
        normalTemp = Math.floor(Math.random() * 10) + 30; // 30-40°C
        normalCurrent = Math.floor(Math.random() * 15) + 35; // 35-50A
        normalLoad = Math.floor(Math.random() * 15) + 45; // 45-60%
        break;
      case '隔离开关':  
        normalTemp = Math.floor(Math.random() * 10) + 25; // 25-35°C
        normalCurrent = Math.floor(Math.random() * 20) + 30; // 30-50A
        normalLoad = Math.floor(Math.random() * 20) + 40; // 40-60%
        break;
      case '互感器':
        normalTemp = Math.floor(Math.random() * 15) + 30; // 30-45°C
        normalCurrent = Math.floor(Math.random() * 25) + 35; // 35-60A
        normalLoad = Math.floor(Math.random() * 25) + 45; // 45-70%
        break;
      case '避雷器':
        normalTemp = Math.floor(Math.random() * 10) + 30; // 30-40°C
        normalCurrent = Math.floor(Math.random() * 10) + 25; // 25-35A
        normalLoad = Math.floor(Math.random() * 15) + 35; // 三十五-50%
        break;
      default:
        normalTemp = Math.floor(Math.random() * 15) + 30; // 30-45°C
        normalCurrent = Math.floor(Math.random() * 20) + 30; // 30-50A
        normalLoad = Math.floor(Math.random() * 20) + 40; // 40-60%
    }
    
    // 更新设备状态和参数
    equipment.status = 'normal';
    equipment.temperature = normalTemp;
    equipment.current = normalCurrent;
    equipment.load = normalLoad;
    
    // 更新变电站状态
    this.updateSubstationStatus(equipment.substationId);
    
    this.saveDB(db);
    return true;
  }

  // ============== 告警相关方法 ==============

  // 获取所有告警
  public getAlerts(): Alert[] {
    const db = this.getDB();
    // 过滤已完成的告警并按时间倒序排序
    const activeAlerts = [...db.alerts]
      .filter(alert => alert.status !== 'completed')
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    // 调试日志：显示当前活跃告警数量
    console.log(`Active alerts: ${activeAlerts.length}`);
    return activeAlerts;
  }

  // 获取设备的告警
  public getAlertsByEquipment(equipmentId: string): Alert[] {
    const db = this.getDB();
    return db.alerts.filter(alert => alert.equipmentId === equipmentId);
  }

  // 添加告警
  public addAlert(alert: Omit<Alert, 'id'>): Alert {
    const db = this.getDB();
    const id = `A${Date.now().toString().slice(-6)}`;
    
    // 获取设备信息以获取变电站ID
    const equipment = db.equipment[alert.equipmentId];
    const substationId = equipment ? equipment.substationId : '';
    const substation = substationId ? db.substations[substationId] : null;
    
    const newAlert: Alert = {
      ...alert,
      id,
      substationId,
      substationName: substation ? substation.name : '未知变电站'
    };
    
    db.alerts.push(newAlert);
    
    // 更新设备状态
    if (equipment) {
      equipment.status = alert.level === 'error' ? 'error' : 'warning';
      this.updateSubstationStatus(substationId);
    }
    
    this.saveDB(db);
    return newAlert;
  }

  // 更新告警状态
  public updateAlertStatus(id: string, status: Alert['status']): boolean {
    const db = this.getDB();
    const alertIndex = db.alerts.findIndex(a => a.id === id);
    if (alertIndex === -1) return false;
    
    db.alerts[alertIndex].status = status;
    
       // 如果告警已完成，恢复设备正常状态
       if (status === 'completed') {
         this.restoreEquipmentNormalState(db.alerts[alertIndex].equipmentId);
         console.log(`告警 ${id} 已完成处理，将从最近告警列表中移除`);
       }
       
       this.saveDB(db);
       
       // 明确通知订阅者数据已变更
       this.notifyListeners();
       return true;
  }

  // 删除告警
  public deleteAlert(id: string): boolean {
    const db = this.getDB();
    const initialLength = db.alerts.length;
    db.alerts = db.alerts.filter(alert => alert.id !== id);
    
    if (db.alerts.length < initialLength) {
      this.saveDB(db);
      return true;
    }
    return false;
  }

  // 清除所有告警
  public clearAlerts(): void {
    const db = this.getDB();
    db.alerts = [];
    this.saveDB(db);
  }

  // ============== 维护记录相关方法 ==============

  // 获取所有维护记录
  public getMaintenanceRecords(): Maintenance[] {
    const db = this.getDB();
    return [...db.maintenance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // 获取设备的维护记录
  public getMaintenanceByEquipment(equipmentId: string): Maintenance[] {
    const db = this.getDB();
    return db.maintenance.filter(m => m.equipmentId === equipmentId);
  }

  // 添加维护记录
  public addMaintenanceRecord(record: Omit<Maintenance, 'id'>): Maintenance {
    const db = this.getDB();
    const id = `M-${Date.now().toString().slice(-6)}`;
    
    const newRecord: Maintenance = {
      ...record,
      id
    };
    
    db.maintenance.push(newRecord);
    
    // 更新设备的最后维护时间
    if (db.equipment[record.equipmentId]) {
      db.equipment[record.equipmentId].lastMaintenance = record.date;
      
      // 简单计算下次维护时间（3个月后）
      const nextDate = new Date(record.date);
      nextDate.setMonth(nextDate.getMonth() + 3);
      db.equipment[record.equipmentId].nextMaintenance = nextDate.toISOString().split('T')[0];
    }
    
    this.saveDB(db);
    toast.success(`已添加维护记录`);
    return newRecord;
  }

  // 更新维护记录
  public updateMaintenanceRecord(id: string, data: Partial<Maintenance>): boolean {
    const db = this.getDB();
    const recordIndex = db.maintenance.findIndex(m => m.id === id);
    if (recordIndex === -1) return false;
    
    db.maintenance[recordIndex] = { ...db.maintenance[recordIndex], ...data };
    this.saveDB(db);
    return true;
  }

  // 删除维护记录
  public deleteMaintenanceRecord(id: string): boolean {
    const db = this.getDB();
    const initialLength = db.maintenance.length;
    db.maintenance = db.maintenance.filter(m => m.id !== id);
    
    if (db.maintenance.length < initialLength) {
      this.saveDB(db);
      return true;
    }
    return false;
  }
}

// 导出数据库实例
export const db = DBService.getInstance();