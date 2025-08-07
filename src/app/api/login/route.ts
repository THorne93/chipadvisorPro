import { NextResponse } from 'next/server';
import { login } from '@/lib'; // <-- your login() function

export async function POST(req: Request) {
  const body = await req.json();
  try {
    await login(body); // This sets the cookie
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 401 });
  }
}

