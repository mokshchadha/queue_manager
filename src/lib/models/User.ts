// src/lib/models/User.ts
import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  user_id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'abstractor' | 'reviewer' | 'customer';
  is_active: boolean;
  permissions: string[];
  profile: {
    first_name?: string;
    last_name?: string;
    avatar?: string;
    department?: string;
  };
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'abstractor', 'reviewer', 'customer'],
    default: 'abstractor'
  },
  is_active: { type: Boolean, default: true },
  permissions: [String],
  profile: {
    first_name: String,
    last_name: String,
    avatar: String,
    department: String
  }
}, {
  timestamps: true
});

export const QueueUser = mongoose.models.QueueUser || mongoose.model<IUser>('QueueUser', UserSchema);

export const rolePermissions = {
  admin: ['create_user', 'edit_user', 'delete_user', 'view_all_orders', 'edit_all_orders', 'access_control', 'view_analytics'],
  manager: ['view_all_orders', 'edit_all_orders', 'assign_orders', 'view_analytics'],
  abstractor: ['view_assigned_orders', 'edit_assigned_orders', 'add_comments'],
  reviewer: ['view_assigned_orders', 'edit_assigned_orders', 'approve_orders', 'add_comments'],
  customer: ['view_own_orders', 'add_comments']
};