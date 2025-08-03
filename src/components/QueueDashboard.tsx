import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Calendar, 
  DollarSign, 
  MessageCircle, 
  Tag, 
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Clock,
  TrendingUp,
  AlertCircle,
  Users,
  FileText,
  X
} from 'lucide-react';

interface Order {
  _id: string;
  order_id: number;
  property_id: string;
  customer_id?: string;
  assigned_to?: string;
  order_status: number;
  order_final_price?: number;
  order_eta?: string;
  order_buyer?: string;
  order_seller?: string;
  score?: number;
  tagged_users?: string[];
  comments?: any[];
  order_creation_date: string;
  order_priority?: number;
}

interface StatusColumn {
  status: number;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  orders: Order[];
}

const orderStatusNames = {
  0: 'Inactive',
  1: 'Received',
  10: 'Cancelled',
  15: 'Assigned',
  18: 'Client Confirmed',
  20: 'Confirmed',
  30: 'Processing',
  40: 'Quote Completed',
  50: 'Completed',
  60: 'Forwarded'
};

const statusConfig = {
  0: { color: 'border-gray-300', bgColor: 'bg-gray-50', textColor: 'text-gray-700', accentColor: 'bg-gray-400' },
  1: { color: 'border-blue-300', bgColor: 'bg-blue-50', textColor: 'text-blue-700', accentColor: 'bg-blue-500' },
  10: { color: 'border-red-300', bgColor: 'bg-red-50', textColor: 'text-red-700', accentColor: 'bg-red-500' },
  15: { color: 'border-yellow-300', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', accentColor: 'bg-yellow-500' },
  18: { color: 'border-orange-300', bgColor: 'bg-orange-50', textColor: 'text-orange-700', accentColor: 'bg-orange-500' },
  20: { color: 'border-green-300', bgColor: 'bg-green-50', textColor: 'text-green-700', accentColor: 'bg-green-500' },
  30: { color: 'border-purple-300', bgColor: 'bg-purple-50', textColor: 'text-purple-700', accentColor: 'bg-purple-500' },
  40: { color: 'border-indigo-300', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', accentColor: 'bg-indigo-500' },
  50: { color: 'border-emerald-300', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', accentColor: 'bg-emerald-500' },
  60: { color: 'border-teal-300', bgColor: 'bg-teal-50', textColor: 'text-teal-700', accentColor: 'bg-teal-500' }
};

const OrderCard: React.FC<{ 
  order: Order; 
  onOrderClick: (order: Order) => void;
  isDragging?: boolean;
}> = ({ order, onOrderClick, isDragging = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getPriorityColor = (priority: number = 0) => {
    if (priority >= 8) return 'text-red-600 bg-red-100';
    if (priority >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const isOverdue = order.order_eta && new Date(order.order_eta) < new Date();

  return (
    <div 
      className={`
        group relative bg-white rounded-xl border-2 border-gray-200 p-4 mb-3 
        cursor-pointer transition-all duration-300 ease-out
        ${isHovered ? 'shadow-xl scale-[1.02] border-blue-300' : 'shadow-sm hover:shadow-lg'}
        ${isDragging ? 'opacity-50 rotate-2' : ''}
      `}
      onClick={() => onOrderClick(order)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority indicator */}
      {order.order_priority && order.order_priority >= 5 && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-bold text-gray-900 text-lg">#{order.order_id}</h4>
            {order.order_priority && order.order_priority >= 5 && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.order_priority)}`}>
                High Priority
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium">{order.property_id}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {order.score !== undefined && (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getScoreColor(order.score)}`}>
              {order.score}
            </span>
          )}
          <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        {order.order_buyer && (
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <span className="truncate font-medium">{order.order_buyer}</span>
          </div>
        )}
        
        {order.order_eta && (
          <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
            <div className={`w-6 h-6 ${isOverdue ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mr-2`}>
              <Calendar className={`w-3 h-3 ${isOverdue ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <span className="font-medium">{formatDate(order.order_eta)}</span>
            {isOverdue && <AlertCircle className="w-4 h-4 ml-1 text-red-500" />}
          </div>
        )}
        
        {order.order_final_price && (
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
              <DollarSign className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-bold text-green-700">${order.order_final_price.toLocaleString()}</span>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {order.comments && order.comments.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <MessageCircle className="w-3 h-3 mr-1" />
                <span className="font-medium">{order.comments.length}</span>
              </div>
            )}
            
            {order.tagged_users && order.tagged_users.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Tag className="w-3 h-3 mr-1" />
                <span className="font-medium">{order.tagged_users.length}</span>
              </div>
            )}
          </div>
          
          {isHovered && (
            <div className="flex items-center space-x-1 opacity-100 transition-opacity duration-200">
              <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                <Eye className="w-3 h-3" />
              </button>
              <button className="p-1 hover:bg-green-100 rounded text-green-600">
                <Edit className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        
        {order.assigned_to && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded-md px-2 py-1">
            <Users className="w-3 h-3 inline mr-1" />
            Assigned to: <span className="font-medium">{order.assigned_to}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusColumn: React.FC<{ 
  status: StatusColumn; 
  isCollapsed: boolean; 
  onToggle: () => void;
  onOrderClick: (order: Order) => void;
  searchTerm: string;
}> = ({ status, isCollapsed, onToggle, onOrderClick, searchTerm }) => {
  const config = statusConfig[status.status];
  
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return status.orders;
    return status.orders.filter(order => 
      order.order_id.toString().includes(searchTerm) ||
      order.property_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_buyer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [status.orders, searchTerm]);

  return (
    <div className={`
      ${config.color} ${config.bgColor} border-2 rounded-2xl 
      min-h-[700px] transition-all duration-500 ease-out
      ${isCollapsed ? 'w-20' : 'w-80'}
      shadow-lg hover:shadow-xl
    `}>
      <div 
        className={`
          p-4 cursor-pointer flex items-center justify-between 
          border-b border-opacity-30 ${config.color}
          hover:bg-opacity-70 transition-colors duration-200
        `}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <div className={`
            w-6 h-6 ${config.accentColor} rounded-lg flex items-center justify-center
            transition-transform duration-300 ${isCollapsed ? '' : 'rotate-0'}
          `}>
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white" />
            )}
          </div>
          
          {!isCollapsed && (
            <>
              <h3 className={`font-bold ${config.textColor} text-lg`}>
                {status.name}
              </h3>
              <div className={`
                ${config.accentColor} text-white px-3 py-1 rounded-full text-sm font-bold
                animate-pulse
              `}>
                {filteredOrders.length}
              </div>
            </>
          )}
        </div>
        
        {!isCollapsed && (
          <button className={`
            p-2 rounded-lg hover:bg-white hover:bg-opacity-50 
            transition-colors duration-200 ${config.textColor}
          `}>
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="p-4 space-y-3 max-h-[620px] overflow-y-auto custom-scrollbar">
          {filteredOrders.length > 0 ? (
            <div className="space-y-3">
              {filteredOrders.map((order, index) => (
                <div
                  key={order._id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <OrderCard 
                    order={order} 
                    onOrderClick={onOrderClick}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <FileText className={`w-8 h-8 ${config.textColor} opacity-50`} />
              </div>
              <h4 className={`font-medium ${config.textColor} mb-2`}>
                {searchTerm ? 'No matching orders' : 'No orders yet'}
              </h4>
              <p className={`text-sm ${config.textColor} opacity-75`}>
                {searchTerm ? 'Try adjusting your search' : 'Orders will appear here when added'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QueueDashboard: React.FC = () => {
  const [statusColumns, setStatusColumns] = useState<StatusColumn[]>([]);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Simulate API delay for smooth loading animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        organizeOrdersByStatus(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeOrdersByStatus = (orders: Order[]) => {
    const activeStatuses = [1, 15, 18, 20, 30, 40, 50];
    const columns: StatusColumn[] = activeStatuses.map(status => {
      const config = statusConfig[status];
      return {
        status,
        name: orderStatusNames[status],
        color: config.color,
        bgColor: config.bgColor,
        textColor: config.textColor,
        orders: orders.filter(order => order.order_status === status)
      };
    });
    
    setStatusColumns(columns);
  };

  const toggleColumn = (status: number) => {
    const newCollapsed = new Set(collapsedColumns);
    if (newCollapsed.has(status)) {
      newCollapsed.delete(status);
    } else {
      newCollapsed.add(status);
    }
    setCollapsedColumns(newCollapsed);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const totalOrders = statusColumns.reduce((sum, col) => sum + col.orders.length, 0);
  const completedOrders = statusColumns.find(col => col.status === 50)?.orders.length || 0;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h3>
          <p className="text-gray-500">Preparing your queue management interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Queue Dashboard</h1>
              <p className="text-gray-600">Manage and track order progress across different stages</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Stats */}
              <div className="flex items-center space-x-6 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
                  <div className="text-xs text-gray-500">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                  <div className="text-xs text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{statusColumns.length}</div>
                  <div className="text-xs text-gray-500">Active Stages</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders, properties, or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center space-x-2 px-4 py-3 border rounded-xl
                transition-all duration-200 ${showFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fadeIn">
              <div className="flex items-center space-x-4">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="abstractor">Abstractors</option>
                  <option value="reviewer">Reviewers</option>
                  <option value="manager">Managers</option>
                </select>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <div className="flex space-x-6 overflow-x-auto pb-4 custom-scrollbar">
          {statusColumns.map((column, index) => (
            <div
              key={column.status}
              className="animate-slideInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <StatusColumn
                status={column}
                isCollapsed={collapsedColumns.has(column.status)}
                onToggle={() => toggleColumn(column.status)}
                onOrderClick={handleOrderClick}
                searchTerm={searchTerm}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-modalSlideIn">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{selectedOrder.order_id}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedOrder.order_status].textColor} ${statusConfig[selectedOrder.order_status].bgColor}`}>
                    {orderStatusNames[selectedOrder.order_status]}
                  </span>
                  {selectedOrder.score && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${selectedOrder.score >= 80 ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : selectedOrder.score >= 60 ? 'text-yellow-700 bg-yellow-100 border-yellow-200' : 'text-red-700 bg-red-100 border-red-200'}`}>
                      Score: {selectedOrder.score}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.property_id}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.order_buyer || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Price</label>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedOrder.order_final_price ? `$${selectedOrder.order_final_price.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.assigned_to || 'Unassigned'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ETA</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedOrder.order_eta ? new Date(selectedOrder.order_eta).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedOrder.order_creation_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium">
                Edit Order
              </button>
              <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">
                Add Comment
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.5s ease-out; }
        .animate-modalSlideIn { animation: modalSlideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default QueueDashboard;