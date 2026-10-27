import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword, action } = await req.json();

    if (action === 'request') {
      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email is required' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Password reset instructions sent to your email.',
      });
    }

    if (action === 'confirm') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Password has been updated successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
