import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, User, Calendar, DollarSign, MessageCircle, Tag } from 'lucide-react';

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
}

interface StatusColumn {
  status: number;
  name: string;
  color: string;
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

const statusColors = {
  0: 'bg-gray-100 border-gray-300',
  1: 'bg-blue-100 border-blue-300',
  10: 'bg-red-100 border-red-300',
  15: 'bg-yellow-100 border-yellow-300',
  18: 'bg-orange-100 border-orange-300',
  20: 'bg-green-100 border-green-300',
  30: 'bg-purple-100 border-purple-300',
  40: 'bg-indigo-100 border-indigo-300',
  50: 'bg-emerald-100 border-emerald-300',
  60: 'bg-teal-100 border-teal-300'
};

const OrderCard: React.FC<{ order: Order; onOrderClick: (order: Order) => void }> = ({ order, onOrderClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOrderClick(order)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">#{order.order_id}</h4>
          <p className="text-sm text-gray-600">{order.property_id}</p>
        </div>
        {order.score !== undefined && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(order.score)}`}>
            {order.score}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {order.order_buyer && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            <span className="truncate">{order.order_buyer}</span>
          </div>
        )}
        
        {order.order_eta && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(order.order_eta)}</span>
          </div>
        )}
        
        {order.order_final_price && (
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>${order.order_final_price.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {order.comments && order.comments.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>{order.comments.length}</span>
            </div>
          )}
          
          {order.tagged_users && order.tagged_users.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Tag className="w-4 h-4 mr-1" />
              <span>{order.tagged_users.length}</span>
            </div>
          )}
        </div>
        
        {order.assigned_to && (
          <div className="text-xs text-gray-500 border-t pt-2">
            Assigned to: {order.assigned_to}
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
}> = ({ status, isCollapsed, onToggle, onOrderClick }) => {
  return (
    <div className={`${statusColors[status.status]} border-2 rounded-lg min-h-[600px] transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <div 
        className="p-3 cursor-pointer flex items-center justify-between border-b border-gray-200"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {!isCollapsed && (
            <>
              <h3 className="font-semibold text-gray-900">{status.name}</h3>
              <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                {status.orders.length}
              </span>
            </>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-3 space-y-3 max-h-[550px] overflow-y-auto">
          {status.orders.map((order) => (
            <OrderCard 
              key={order._id} 
              order={order} 
              onOrderClick={onOrderClick}
            />
          ))}
          {status.orders.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No orders in this status
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
    const columns: StatusColumn[] = activeStatuses.map(status => ({
      status,
      name: orderStatusNames[status],
      color: statusColors[status],
      orders: orders.filter(order => order.order_status === status)
    }));
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Queue Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and track order progress across different stages</p>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {statusColumns.map((column) => (
          <StatusColumn
            key={column.status}
            status={column}
            isCollapsed={collapsedColumns.has(column.status)}
            onToggle={() => toggleColumn(column.status)}
            onOrderClick={handleOrderClick}
          />
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.order_id}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property ID</label>
                <p className="mt-1 text-gray-900">{selectedOrder.property_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-gray-900">{orderStatusNames[selectedOrder.order_status]}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Buyer</label>
                <p className="mt-1 text-gray-900">{selectedOrder.order_buyer || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                <p className="mt-1 text-gray-900">{selectedOrder.assigned_to || 'Unassigned'}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Order
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Add Comment
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueDashboard;