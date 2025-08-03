// src/lib/models/Order.ts
import mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  order_id: number;
  property_id: string;
  customer_id?: string;
  abstrator_id?: string;
  organization_id?: string;
  file_id?: string;
  order_status: number;
  order_custom_price?: number;
  order_final_price?: number;
  order_creation_date?: Date;
  order_completion_date?: Date;
  order_assigned_date?: Date;
  order_eta?: Date;
  order_priority?: number;
  order_buyer?: string;
  order_seller?: string;
  order_parcel?: string;
  order_tags?: string;
  latest_note?: string;
  // Queue Manager specific fields
  assigned_to?: string;
  tagged_users?: string[];
  score?: number;
  comments?: Array<{
    user_id: string;
    username: string;
    comment: string;
    created_at: Date;
  }>;
  status_history?: Array<{
    from_status: number;
    to_status: number;
    changed_by: string;
    changed_at: Date;
    note?: string;
  }>;
}

const CommentSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const StatusHistorySchema = new mongoose.Schema({
  from_status: { type: Number, required: true },
  to_status: { type: Number, required: true },
  changed_by: { type: String, required: true },
  changed_at: { type: Date, default: Date.now },
  note: String
});

const OrderSchema = new mongoose.Schema({
  order_id: { type: Number, required: true, unique: true },
  property_id: { type: String, required: true },
  customer_id: String,
  abstrator_id: String,
  organization_id: String,
  file_id: String,
  order_status: { type: Number, default: 1 },
  order_custom_price: Number,
  order_final_price: Number,
  order_creation_date: { type: Date, default: Date.now },
  order_completion_date: Date,
  order_assigned_date: Date,
  order_eta: Date,
  order_priority: { type: Number, default: 0 },
  order_buyer: String,
  order_seller: String,
  order_parcel: String,
  order_tags: String,
  latest_note: String,
  // Queue Manager specific fields
  assigned_to: String,
  tagged_users: [String],
  score: { type: Number, default: 0 },
  comments: [CommentSchema],
  status_history: [StatusHistorySchema]
}, {
  timestamps: true
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export const orderStatusMap = {
  received: 1,
  cancelled: 10,
  assigned: 15,
  clientconf: 18,
  confirmed: 20,
  processing: 30,
  quotecompleted: 40,
  completed: 50,
  forwarded: 60,
  inActive: 0
};

export const orderStatusNames = {
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