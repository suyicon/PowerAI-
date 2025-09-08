import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mr-2">
              <i className="fa-solid fa-bolt text-white"></i>
            </div>
            <span className="text-lg font-semibold text-gray-900 hidden sm:inline">电网设备管理系统</span>
          </Link>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="text-gray-500 hover:text-gray-900 focus:outline-none relative">
            <i className="fa-solid fa-bell text-xl"></i>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </nav>
  );
}