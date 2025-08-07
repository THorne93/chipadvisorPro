import prisma from '../../../../lib/prisma';


export default async function handler(req, res) {
  try {
    const totalReviews = await prisma.review.count();
    res.status(200).json({ totalReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get review count' });
  }
}
