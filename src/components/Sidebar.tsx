import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  // 默认显示所有导航项，无需权限控制
  const navItems = [
    { 
      path: '/', 
      name: '仪表盘', 
      icon: 'fa-tachometer-alt'
    },
    { 
      path: '/equipment', 
      name: '变电站', 
      icon: 'fa-microchip'
    },
    { 
      path: '/transmission', 
      name: '输电系统', 
      icon: 'fa-bolt'
    },
    { 
      path: '/distribution', 
      name: '配电系统', 
      icon: 'fa-network-wired'
    },

    { 
      path: '/reports', 
      name: '数据分析', 
      icon: 'fa-chart-line'
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo for desktop */}
      <div className="hidden lg:flex items-center justify-center h-16 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mr-2">
          <i className="fa-solid fa-bolt text-white"></i>
        </div>
        <span className="text-lg font-semibold text-gray-900">电网设备管理</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition duration-150 ease-in-out ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <i className={`fa-solid ${item.icon} w-5 h-5 mr-3`}></i>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Status summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">系统状态</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              正常运行
            </span>
            <span className="text-sm font-medium text-gray-900">87%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              需要注意
            </span>
            <span className="text-sm font-medium text-gray-900">10%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              故障设备
            </span>
            <span className="text-sm font-medium text-gray-900">3%</span>
          </div>
        </div>
      </div>
    </div>
  );
}