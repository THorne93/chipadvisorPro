import prisma from '../../../../lib/prisma';


export default async function handler(req, res) {
    try {
        const result = await prisma.$queryRaw`
        SELECT DISTINCT
          c.name AS restaurant_name,
          r.location
        FROM
          public.chip AS c
        INNER JOIN
          public.review AS r ON c.id = r.chip
        WHERE
          r.location IS NOT NULL
        ORDER BY
          restaurant_name, r.location;
      `
        const allChips = result.map(row => ({
            id: row.chip_id,          // use chip_id alias here
            name: row.restaurant_name, // use restaurant_name alias here
            location: row.location
        }));
        res.status(200).json({ allChips });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get restaurant count' });
    }
}

