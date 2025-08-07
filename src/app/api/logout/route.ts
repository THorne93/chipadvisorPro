import { NextResponse } from 'next/server';
import { logout } from '@/lib'; // <-- your login() function

export async function POST() {
  try {
    await logout(); // This clears the cookie
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Logout failed' }, { status: 401 });
  }
}

