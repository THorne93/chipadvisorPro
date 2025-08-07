// app/api/reviews/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust path if needed

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const id = params.id;

    try {
        const reviewId = parseInt(id, 10);
        if (isNaN(reviewId)) {
            return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
        }

        // Optional: check if review exists before deleting
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }
            await prisma.rating.deleteMany({ where: { review_id: reviewId } });

        await prisma.review.delete({ where: { id: reviewId } });

        return NextResponse.json({ message: 'Review deleted' }, { status: 200 });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
