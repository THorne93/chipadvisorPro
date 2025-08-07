import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log(data);

    const restaurant = await prisma.pending.create({
      data: {
        name: data.chip,
        authorId: data.userId,
        title: data.title,
        content: data.review,
        score: data.rating,
        img_url: data.image,

        // This assumes `location` is a valid nested object in your Prisma schema,
        // otherwise flatten these fields as separate keys (see next note).
        location: {
          address: data.address,
          city: data.city,
          country: data.country,
        },
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
