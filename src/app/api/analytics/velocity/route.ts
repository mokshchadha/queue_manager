
// src/app/api/analytics/velocity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { QueueUser } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const role = searchParams.get('role');

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get users
    const userQuery: any = { is_active: true };
    if (role && role !== 'all') userQuery.role = role;
    
    const users = await QueueUser.find(userQuery).lean();

    const velocityData = await Promise.all(
      users.map(async (user) => {
        // Get completed orders
        const completedOrders = await Order.find({
          assigned_to: user.user_id,
          order_status: 50, // completed
          order_completion_date: { $gte: startDate }
        }).lean();

        // Get orders in progress
        const inProgressOrders = await Order.countDocuments({
          assigned_to: user.user_id,
          order_status: { $in: [15, 20, 30, 40] }
        });

        // Calculate average completion time
        const completionTimes = completedOrders
          .filter(order => order.order_creation_date && order.order_completion_date)
          .map(order => {
            const created = new Date(order.order_creation_date!);
            const completed = new Date(order.order_completion_date!);
            return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          });

        const avgCompletionTime = completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
          : 0;

        // Calculate average score
        const scoresWithValues = completedOrders
          .filter(order => order.score !== undefined && order.score !== null)
          .map(order => order.score!);
        
        const avgScore = scoresWithValues.length > 0
          ? scoresWithValues.reduce((sum, score) => sum + score, 0) / scoresWithValues.length
          : 0;

        return {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          orders_completed: completedOrders.length,
          orders_in_progress: inProgressOrders,
          average_completion_time: avgCompletionTime,
          score_average: avgScore,
          last_7_days: completedOrders.filter(order => {
            const created = new Date(order.order_completion_date!);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return created >= sevenDaysAgo;
          }).length,
          last_30_days: completedOrders.length,
          productivity_trend: 'stable' as 'up' | 'down' | 'stable'
        };
      })
    );

    return NextResponse.json({
      success: true,
      velocityData
    });
  } catch (error) {
    console.error('Error fetching velocity data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch velocity data' },
      { status: 500 }
    );
  }
}