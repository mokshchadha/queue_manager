import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Shield, User, Mail, Users } from 'lucide-react';

interface User {
  _id: string;
  user_id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'abstractor' | 'reviewer' | 'customer';
  is_active: boolean;
  profile: {
    first_name?: string;
    last_name?: string;
    department?: string;
  };
  created_at: string;
}

interface NewUser {
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'abstractor' | 'reviewer' | 'customer';
  first_name: string;
  last_name: string;
  department: string;
}

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  abstractor: 'bg-green-100 text-green-800',
  reviewer: 'bg-purple-100 text-purple-800',
  customer: 'bg-gray-100 text-gray-800'
};

const rolePermissions = {
  admin: ['Full System Access', 'User Management', 'Order Management', 'Analytics'],
  manager: ['Order Management', 'Team Oversight', 'Analytics', 'Assignment Control'],
  abstractor: ['View Assigned Orders', 'Edit Orders', 'Add Comments'],
  reviewer: ['Review Orders', 'Approve/Reject', 'Quality Control'],
  customer: ['View Own Orders', 'Add Comments', 'Basic Access']
};

const UserRow: React.FC<{ 
  user: User; 
  onEdit: (user: User) => void; 
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, newStatus: boolean) => void;
}> = ({ user, onEdit, onDelete, onToggleStatus }) => {
  const fullName = `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim() || user.username;
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{fullName}</div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <div className="text-sm text-gray-900">{user.email}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
          <Shield className="h-3 w-3 mr-1" />
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.profile.department || 'N/A'}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleStatus(user._id, !user.is_active)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {user.is_active ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
          {user.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(user)}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(user._id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

const UserForm: React.FC<{
  user?: User;
  onSave: (user: NewUser | User) => void;
  onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<NewUser>({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'abstractor',
    first_name: user?.profile.first_name || '',
    last_name: user?.profile.last_name || '',
    department: user?.profile.department || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onSave({ ...user, ...formData, profile: { ...user.profile, ...formData } });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {user ? 'Edit User' : 'Add New User'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="abstractor">Abstractor</option>
              <option value="reviewer">Reviewer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {user ? 'Update' : 'Create'} User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AccessControlPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: NewUser) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers([...users, data.user]);
        setShowForm(false);
      } else {
        alert(data.message || 'Error creating user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  const handleUpdateUser = async (userData: User) => {
    try {
      const response = await fetch(`/api/users/${userData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(user => user._id === userData._id ? data.user : user));
        setEditingUser(null);
      } else {
        alert(data.message || 'Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
      } else {
        alert(data.message || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleToggleStatus = async (userId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, is_active: newStatus } : user
        ));
      } else {
        alert(data.message || 'Error updating user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(user => user.role === selectedRole);

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Access Control Panel</h1>
            <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {Object.entries(roleStats).map(([role, count]) => (
            <div key={role} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {role.charAt(0).toUpperCase() + role.slice(1)}s
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="abstractor">Abstractor</option>
            <option value="reviewer">Reviewer</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onEdit={setEditingUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedRole === 'all' ? 'Get started by creating a new user.' : `No users with ${selectedRole} role.`}
            </p>
          </div>
        )}
      </div>

      {/* Role Permissions Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(rolePermissions).map(([role, permissions]) => (
          <div key={role} className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className={`font-semibold mb-3 px-2 py-1 rounded text-sm ${roleColors[role as keyof typeof roleColors]}`}>
              {role.charAt(0).toUpperCase() + role.slice(1)} Permissions
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {permissions.map((permission, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-3 w-3 text-green-500 mr-2" />
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User Form Modal */}
      {(showForm || editingUser) && (
        <UserForm
          user={editingUser || undefined}
          onSave={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AccessControlPanel;