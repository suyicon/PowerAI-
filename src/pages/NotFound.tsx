import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6">
      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <i className="fa-solid fa-exclamation-triangle text-5xl text-blue-600"></i>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">页面未找到</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        抱歉，您访问的页面不存在或已被删除。请检查URL或返回主页。
      </p>
      
      <div className="flex space-x-4">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i className="fa-solid fa-home mr-2"></i>
          返回主页
        </Link>
        
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          返回上一页
        </button>
      </div>
    </div>
  );
}