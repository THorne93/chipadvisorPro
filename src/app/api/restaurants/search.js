import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const name = (req.query.name || '').toLowerCase();

    const result = await prisma.$queryRaw`
      SELECT
        c.id AS chip_id,
        c.name AS restaurant_name,
        c.location,
        c.img_url
      FROM
        public."Chip" AS c
        WHERE LOWER(c.name) LIKE ${'%' + name + '%'}
      ORDER BY
        c.id;
    `;

    const restaurants = result.map(row => ({
      id: row.chip_id,
      name: row.restaurant_name,
      location: row.location,
      image: row.img_url
    }));

    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to search restaurants' });
  }
}
