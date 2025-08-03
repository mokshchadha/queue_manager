// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    let query: any = {};
    if (status) query.order_status = parseInt(status);
    if (assignedTo) query.assigned_to = assignedTo;

    const orders = await Order.find(query)
      .sort({ order_creation_date: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total: await Order.countDocuments(query)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const orderData = await request.json();
    
    // Generate order_id if not provided
    if (!orderData.order_id) {
      const lastOrder = await Order.findOne().sort({ order_id: -1 }).lean();
      orderData.order_id = (lastOrder?.order_id || 0) + 1;
    }

    const order = new Order(orderData);
    await order.save();

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
