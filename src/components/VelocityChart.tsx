import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Award, Clock, Filter } from 'lucide-react';

interface VelocityData {
  user_id: string;
  username: string;
  role: string;
  orders_completed: number;
  orders_in_progress: number;
  average_completion_time: number;
  score_average: number;
  last_7_days: number;
  last_30_days: number;
  productivity_trend: 'up' | 'down' | 'stable';
}

interface TimeRangeData {
  date: string;
  completed_orders: number;
  average_time: number;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const VelocityChart: React.FC = () => {
  const [velocityData, setVelocityData] = useState<VelocityData[]>([]);
  const [timeRangeData, setTimeRangeData] = useState<TimeRangeData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'orders_completed' | 'average_completion_time' | 'score_average'>('orders_completed');

  useEffect(() => {
    fetchVelocityData();
    fetchTimeRangeData();
    fetchStatusDistribution();
  }, [selectedTimeRange, selectedRole]);

  const fetchVelocityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/velocity?timeRange=${selectedTimeRange}&role=${selectedRole}`);
      const data = await response.json();
      
      if (data.success) {
        setVelocityData(data.velocityData);
      }
    } catch (error) {
      console.error('Error fetching velocity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeRangeData = async () => {
    try {
      const response = await fetch(`/api/analytics/timeline?timeRange=${selectedTimeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setTimeRangeData(data.timelineData);
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    }
  };

  const fetchStatusDistribution = async () => {
    try {
      const response = await fetch('/api/analytics/status-distribution');
      const data = await response.json();
      
      if (data.success) {
        setStatusDistribution(data.statusData);
      }
    } catch (error) {
      console.error('Error fetching status distribution:', error);
    }
  };

  const sortedVelocityData = [...velocityData].sort((a, b) => {
    if (sortBy === 'average_completion_time') {
      return a[sortBy] - b[sortBy]; // Ascending for time (lower is better)
    }
    return b[sortBy] - a[sortBy]; // Descending for others
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getPerformanceColor = (value: number, type: 'score' | 'time' | 'orders') => {
    if (type === 'score') {
      if (value >= 80) return 'text-green-600 bg-green-100';
      if (value >= 60) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    if (type === 'time') {
      if (value <= 2) return 'text-green-600 bg-green-100';
      if (value <= 5) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    if (type === 'orders') {
      if (value >= 20) return 'text-green-600 bg-green-100';
      if (value >= 10) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Velocity Chart</h1>
            <p className="text-gray-600 mt-2">Track team performance and order completion metrics</p>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="abstractor">Abstractors</option>
              <option value="reviewer">Reviewers</option>
              <option value="manager">Managers</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="orders_completed">Orders Completed</option>
              <option value="average_completion_time">Avg Completion Time</option>
              <option value="score_average">Average Score</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {velocityData.reduce((sum, user) => sum + user.orders_completed, 0)}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Completion Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {velocityData.length > 0 
                    ? (velocityData.reduce((sum, user) => sum + user.average_completion_time, 0) / velocityData.length).toFixed(1)
                    : '0'
                  } days
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{velocityData.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Team Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {velocityData.length > 0 
                    ? (velocityData.reduce((sum, user) => sum + user.score_average, 0) / velocityData.length).toFixed(0)
                    : '0'
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Orders Completed Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Completed by User</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedVelocityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="username" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders_completed" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed_orders" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedVelocityData.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.role}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(user.orders_completed, 'orders')}`}>
                        {user.orders_completed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(user.average_completion_time, 'time')}`}>
                        {user.average_completion_time.toFixed(1)}d
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(user.score_average, 'score')}`}>
                        {user.score_average.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTrendIcon(user.productivity_trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VelocityChart;