
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { QueueUser } from '@/lib/models/User';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    let query: any = {};
    if (role && role !== 'all') query.role = role;
    if (isActive !== null) query.is_active = isActive === 'true';

    const users = await QueueUser.find(query)
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const userData = await request.json();
    
    // Check if username or email already exists
    const existingUser = await QueueUser.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Generate user_id
    userData.user_id = uuidv4();
    
    const user = new QueueUser(userData);
    await user.save();

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
