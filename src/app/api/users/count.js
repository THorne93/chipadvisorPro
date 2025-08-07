import prisma from '../../../../lib/prisma';


export default async function handler(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
}
