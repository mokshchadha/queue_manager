import { NextRequest, NextResponse } from 'next/server';
import users from '../../../../lib/users.json';
import { signToken, setAuthCookie } from '../../../../lib/auth';
import { LoginRequest } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password required' },
        { status: 400 }
      );
    }

    // Check if user exists and password matches
    const userRecord = users as Record<string, string>;
    if (userRecord[username] && userRecord[username] === password) {
      const token = signToken({ username });
      const response = NextResponse.json({
        message: 'Login successful',
        user: { username }
      });
      
      setAuthCookie(response.headers, token);
      return response;
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}