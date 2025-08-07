import prisma from '../../../../lib/prisma';


export default async function handler(req, res) {
    try {
        const totalRestaurants = await prisma.chip.count();
        res.status(200).json({ totalRestaurants });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get restaurant count' });
    }
}

