import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Demo/mock authentication logic (or database query)
    const token = `jwt-${Buffer.from(email + ':' + Date.now()).toString('base64')}`;
    const user = {
      id: 'usr-1',
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role: 'Candidate',
      token,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
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
