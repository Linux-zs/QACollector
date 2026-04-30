import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <img src="/favicon.ico" alt="TDX" className="w-6 h-6" />
          TDXQAcollector
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/manage" className="text-sm text-gray-600 hover:text-indigo-600">
                词条管理
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-gray-600 hover:text-indigo-600">
                  用户管理
                </Link>
              )}
              <span className="text-sm text-gray-500">
                {user.username} <span className="text-xs text-gray-400">({user.role})</span>
              </span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">登录</Link>
              <Link to="/register" className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
