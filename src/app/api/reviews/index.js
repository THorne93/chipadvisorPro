import prisma from '../../../../lib/prisma';


export default async function handler(req, res) {
  const reviews = await prisma.review.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc', // change to your timestamp field
    },
    include: {
      chip: true,
      rating: true,
    },
  });

  res.status(200).json(reviews);
}