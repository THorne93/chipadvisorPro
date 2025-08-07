import { NextResponse } from 'next/server';
import { confirmRestaurant } from  "@/lib";

export async function POST(req: Request) {
  const { id } = await req.json();
  await confirmRestaurant(id);
  return NextResponse.json({ success: true });
}
