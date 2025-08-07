import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    try {
        const totalRatings = await prisma.rating.count();
        res.status(200).json({ totalRatings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get rating count' });
    }
}

