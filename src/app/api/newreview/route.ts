import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log(data)
    

    const review = await prisma.review.create({
      data: {
        title: data.title,
        chipId: data.chip_id,       
        authorId: data.user_id, 
        content: data.content,
      },
    });

    await prisma.rating.create({
      data: {
        chipId: data.chip_id,
        userId: data.user_id,
        score: data.rating,
        review_id: review.id, 
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
