import { prisma } from '@/lib/prisma';
import Reviews from './Reviews';
import QuillReview from './QuillReview';
import { Button } from 'antd';
import Link from 'next/link';

import { getSession } from '../../../../lib'
import NewReview from './NewReview';
import { Chip, Review, Rating } from '@prisma/client';
import slugify from 'slugify';

type Params = {
    params: {
        slug: string;
    };
};

export default async function ChipPage({ params }: Params) {
    const session = await getSession();
    const isAdmin = session?.user.role === 'ADMIN';
    const userId = session?.user?.id || null;
    const { slug } = params;
    const [slugNamePart, idPart] = slug.split('-');
    const chipId = parseInt(idPart, 10);
    const readableChip = slugNamePart
        .replace(/-/g, ' ');

    const [reviews, ratingStats, rankingResult] = await Promise.all([
        prisma.review.findMany({
            where: { chipId },
            include: {
                chip: true,
                rating: true,
                author: true,
            },
        }),
        prisma.rating.aggregate({
            where: { chipId },
            _avg: { score: true },
        }),
        prisma.$queryRaw<
            { rank: number; totalCount: number }[]
        >`
      WITH ranked_chips AS (
        SELECT c.id AS "chipId", AVG(r.score) AS "avgScore",
          RANK() OVER (ORDER BY AVG(r.score) DESC) AS rank
        FROM "Chip" c
        LEFT JOIN "Rating" r ON r."chip_id" = c.id
        GROUP BY c.id
      )
      SELECT rc.rank,
        (SELECT COUNT(DISTINCT c2.id)
         FROM "Chip" c2
         LEFT JOIN "Rating" r2 ON r2."chip_id" = c2.id
         WHERE r2.score IS NOT NULL) AS totalCount
      FROM ranked_chips rc
      WHERE rc."chipId" = ${chipId};
    `,
    ]);

    const chipLocation = reviews[0]?.chip?.location as {
        country?: string;
        city?: string;
        address?: string;
    } | undefined;
    console.log(reviews)
    const country = chipLocation?.country;
    const city = chipLocation?.city;
    let slugCity = '';
    let slugCountry = '';

    if (city) slugCity = slugify(city);
    if (country) slugCountry = slugify(country);

    let rankingCountry: { rank: number; totalCount: number }[] | null = null;
    let rankingCity: { rank: number; totalCount: number }[] | null = null;

    if (country) {
        rankingCountry = await prisma.$queryRaw<
            { rank: number; totalCount: number }[]
        >`
      WITH ranked_chips AS (
        SELECT
          c.id AS "chipId",
          AVG(r.score) AS "avgScore",
          RANK() OVER (ORDER BY AVG(r.score) DESC) AS rank
        FROM "Chip" c
        LEFT JOIN "Rating" r ON r."chip_id" = c.id
        WHERE c.location->>'country' = ${country}
        GROUP BY c.id
      )
      SELECT
        rc.rank,
        (
          SELECT COUNT(DISTINCT c2.id)
          FROM "Chip" c2
          LEFT JOIN "Rating" r2 ON r2."chip_id" = c2.id
          WHERE c2.location->>'country' = ${country}
            AND r2.score IS NOT NULL
        ) AS totalCount
      FROM ranked_chips rc
      WHERE rc."chipId" = ${chipId};
    `;

        rankingCity = await prisma.$queryRaw<
            { rank: number; totalCount: number }[]
        >`
      WITH ranked_chips AS (
        SELECT
          c.id AS "chipId",
          AVG(r.score) AS "avgScore",
          RANK() OVER (ORDER BY AVG(r.score) DESC) AS rank
        FROM "Chip" c
        LEFT JOIN "Rating" r ON r."chip_id" = c.id
        WHERE c.location->>'city' = ${city}
        GROUP BY c.id
      )
      SELECT
        rc.rank,
        (
          SELECT COUNT(DISTINCT c2.id)
          FROM "Chip" c2
          LEFT JOIN "Rating" r2 ON r2."chip_id" = c2.id
          WHERE c2.location->>'city' = ${city}
            AND r2.score IS NOT NULL
        ) AS totalCount
      FROM ranked_chips rc
      WHERE rc."chipId" = ${chipId};
    `;
    }

    const averageScore = ratingStats._avg?.score;

    return (
        <div className="my-4 mx-auto w-4/5 pb-4">
            <div className="flex flex-row p-4">
                <div className="w-2/6">
                    <img
                        src={reviews[0]?.chip?.img_url || '/default-chip-image.jpg'}
                        alt="Chips Banner"
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="w-4/6 text-left px-4">
                    <h1 className="text-3xl font-bold mb-4">{readableChip}</h1>
                    <table className="w-full mb-4">
                        <tbody>
                            <tr>
                                <td className="text-xl text-gray-700">Location</td>
                                <td className="text-xl text-gray-700">
                                    {chipLocation?.address},{" "}
                                    <Link
                                        href={`/city/${slugCity}`}
                                        className="hover:underline"
                                    >
                                        {city}
                                    </Link>,{" "}
                                    <Link
                                        href={`/country/${slugCountry}`}
                                        className="hover:underline"
                                    >
                                        {country}
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-xl text-gray-700">Average Score</td>
                                <td className="text-xl text-gray-700">
                                    {averageScore !== null ? `${averageScore?.toFixed(2)} / 5` : 'No ratings yet'}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-xl text-gray-700">Ranking</td>
                                <td className="text-xl text-gray-700">
                                    {rankingResult && rankingResult.length > 0
                                        ? `#${rankingResult[0].rank} overall, #${rankingCity?.[0]?.rank} in ${city}, #${rankingCountry?.[0]?.rank} in ${country}`
                                        : 'No rank'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row  my-4 pb-32">
                {/* Left Column */}
                <div className="w-full flex flex-col">
                    <h2 className="text-2xl font-bold px-4 mb-4">Write a Review</h2>
                    <NewReview chipId={chipId} userId={userId ? userId : null} />
                </div>

                {/* Right Column */}
                <div className="w-full flex flex-col">
                    <h2 className="text-2xl font-bold px-4 mb-4">Reviews</h2>
                    <Reviews reviews={reviews} isAdmin={isAdmin} />
                </div>
            </div>

        </div>
    )
}
