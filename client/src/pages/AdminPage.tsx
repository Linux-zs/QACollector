import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

const ROLES = ['admin', 'contributor', 'viewer'] as const;

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadUsers();
  }, [isAdmin]);

  async function loadUsers() {
    try {
      setUsers(await api.getUsers());
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: number, role: string) {
    try {
      await api.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(userId: number) {
    if (!confirm('确定删除此用户？')) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">用户管理</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">用户名</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">角色</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">注册时间</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{u.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.username}</td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
