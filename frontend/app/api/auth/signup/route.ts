import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const token = `jwt-${Buffer.from(email + ':' + Date.now()).toString('base64')}`;
    const user = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'Candidate',
      token,
    };

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      token,
      user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
