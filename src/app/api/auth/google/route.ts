import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { signToken, setAuthCookie } from '../../../../lib/auth';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Create our custom JWT token for the authenticated Google user
        const username = session.user.username || session.user.email?.split('@')[0] || 'user';
        const token = signToken({ username });

        const response = NextResponse.json({
            message: 'Login successful',
            user: { username }
        });

        setAuthCookie(response.headers, token);
        return response;
    } catch (error) {
        console.error('Google auth error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}