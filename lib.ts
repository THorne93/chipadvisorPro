import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';
const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);
type Role = 'USER' | 'ADMIN';
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1hr")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(values: { email: string; password: string }) {
  // Verify credentials && get the user
  const email = values.email.trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      role: true, // make sure to include this
    }
  }); if (!user || !user.password) {
    console.error("No user found or password missing for email:", values.email);
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(values.password, user.password);
  if (!isPasswordValid) {
    console.error("Invalid password for email:", values.email);
    throw new Error('Invalid email or password');
  }

  // Create the session with minimal user info
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.username,
    role: user.role as Role
  };
  const session = await encrypt({ user: sessionUser, expires });
  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const cookieStore = await cookies(); // must await this now
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
export async function getLatestReviews(limit = 10) {
  return await prisma.review.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      chip: true,
      rating: true,
    },
  });
}

export async function getStats() {
  const [
    totalReviews,
    totalChips,
    totalUsers,
    totalRatings,
  ] = await Promise.all([
    prisma.review.count(),
    prisma.chip.count(),
    prisma.user.count(),
    prisma.rating.count(),
  ]);

  return {
    totalReviews,
    totalChips,
    totalUsers,
    totalRatings,
  };
}

export async function getCountryChips(slug: string) {
  const readableCountry = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return await prisma.$queryRaw`
      SELECT 
          t1.id, t1.name,  t1.location, t1.img_url, t1."createdAt" AS latest_review, t1."content" as content, ROUND(AVG(r2.score)::numeric, 2) AS average_rating, count(r2.score) as total_ratings
      FROM (
          SELECT c.id, c.name, c.location,c.img_url, r."createdAt", r."content"
          FROM "Chip" c 
          LEFT JOIN LATERAL (
              SELECT "createdAt","content"
              FROM "Review" r
              WHERE r.chip = c.id
              ORDER BY r."createdAt" DESC
              LIMIT 1
          ) AS r ON true
      ) AS t1 
      LEFT JOIN "Rating" r2 ON t1.id = r2.chip_id
      WHERE t1.location->>'country' = ${readableCountry}
      GROUP BY t1.id, t1.name, t1.location, t1."createdAt",t1."content",t1."img_url"
      ORDER BY t1.name;
    `;
}

export async function getCountryRank(slug: string) {
  const readableCountry = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  return await prisma.$queryRaw`
WITH country_scores AS (
  SELECT 
   c.location->>'country' AS country,
  ROUND(AVG(r.score)::numeric, 2) AS average_score
  FROM "Chip" c
  LEFT JOIN "Rating" r ON r.chip_id = c.id
  WHERE c.location->>'country' IS NOT NULL
  GROUP BY c.location->>'country'
),
ranked_countries AS (
  SELECT 
    country,
    average_score,
    RANK() OVER (ORDER BY average_score DESC) AS rank
  FROM country_scores
)
SELECT 
  country,
  average_score,
  rank,
  (SELECT COUNT(*) FROM country_scores) AS total_countries
FROM ranked_countries
WHERE country = ${readableCountry};
`
}
export async function getCountryRating(slug: string) {
  const readableCountry = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  return await prisma.$queryRaw`
    SELECT 
  ROUND(AVG(r.score)::numeric, 2) AS average_country_score
FROM "Chip" c
LEFT JOIN "Rating" r ON r.chip_id = c.id
WHERE c.location->>'country' = ${readableCountry};`
}

export async function getCityChips(slug: string) {
  const readableCity = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  return await prisma.$queryRaw`
          SELECT 
          t1.id, t1.name, t1.location, t1.img_url, t1."createdAt" AS latest_review, t1."content" as content, ROUND(AVG(r2.score)::numeric, 2) AS average_rating, count(r2.score) as total_ratings
      FROM (
          SELECT c.id, c.name, c.location,c.img_url, r."createdAt", r."content" 
          FROM "Chip" c 
          LEFT JOIN LATERAL (
              SELECT "createdAt","content"
              FROM "Review" r
              WHERE r.chip = c.id
              ORDER BY r."createdAt" DESC
              LIMIT 1
          ) AS r ON true
      ) AS t1 
      LEFT JOIN "Rating" r2 ON t1.id = r2.chip_id
      WHERE t1.location->>'city' = ${readableCity}
      GROUP BY t1.id, t1.name, t1.location, t1."createdAt",t1."content",t1."img_url"
      ORDER BY t1.name;
    `
}

export async function getCityRank(slug: string) {
  const readableCity = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  return await prisma.$queryRaw`
  WITH city_scores AS (
  SELECT 
   c.location->>'city' AS city,
  ROUND(AVG(r.score)::numeric, 2) AS average_score
  FROM "Chip" c
  LEFT JOIN "Rating" r ON r.chip_id = c.id
  WHERE c.location->>'city' IS NOT NULL
  GROUP BY c.location->>'city'
),
ranked_cities AS (
  SELECT 
    city,
    average_score,
    RANK() OVER (ORDER BY average_score DESC) AS rank
  FROM city_scores
)
SELECT 
  city,
  average_score,
  rank,
  (SELECT COUNT(*) FROM city_scores) AS total_cities
FROM ranked_cities
WHERE city = ${readableCity};
`
}
export async function getCityRating(slug: string) {
  const readableCity = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  return await prisma.$queryRaw`
   SELECT 
  ROUND(AVG(r.score)::numeric, 2) AS average_city_score
FROM "Chip" c
LEFT JOIN "Rating" r ON r.chip_id = c.id
WHERE c.location->>'city' = ${readableCity};`
}
export async function searchRestaurantsByName(name: string) {
  try {
    const searchTerm = `%${name.toLowerCase()}%`;

    const result = await prisma.$queryRaw`
      SELECT
        c.id AS chip_id,
        c.name AS restaurant_name,
        c.location,
        c.img_url
      FROM
        public."Chip" AS c
      WHERE LOWER(c.name) LIKE ${searchTerm}
      OR LOWER(c.location->>'city') LIKE ${searchTerm}
      OR LOWER(c.location->>'country') LIKE ${searchTerm}
      ORDER BY c.id;
    `;

    return result.map(row => ({
      id: row.chip_id,
      name: row.restaurant_name,
      location: row.location,
      image: row.img_url,
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function getPendingRestaurants() {
  return await prisma.pending.findMany();
}

export async function confirmRestaurant(id: number) {
  const data = await prisma.pending.findUnique({ where: { id } });
  if (!data) throw new Error('Restaurant not found');

  const location = data.location as {
    address: string;
    city: string;
    country: string;
  };

  const chipA = await prisma.chip.create({
    data: {
      name: data.name,
      img_url: data.img_url,
      location: {
        address: location.address,
        city: location.city,
        country: location.country,
      },
    },
  });

  const review = await prisma.review.create({
    data: {
      title: data.title,
      chipId: chipA.id,
      authorId: data.authorId,
      content: data.content,
    },
  });

  await prisma.rating.create({
    data: {
      chipId: chipA.id,
      userId: data.authorId,
      score: data.score,
      review_id: review.id,
    },
  });

  // Delete the pending restaurant
  await prisma.pending.delete({ where: { id } });

  return { success: true };
}

export async function rejectRestaurant() {

}

export async function getChipData(chipId: number) {
  // Main data queries together:
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

  // Extract location info safely
  const chipLocation = reviews[0]?.chip?.location as
    | { country?: string; city?: string; address?: string }
    | undefined;

  // Ranking queries by country and city, if available
  let rankingCountry = null;
  let rankingCity = null;

  if (chipLocation?.country) {
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
        WHERE c.location->>'country' = ${chipLocation.country}
        GROUP BY c.id
      )
      SELECT
        rc.rank,
        (
          SELECT COUNT(DISTINCT c2.id)
          FROM "Chip" c2
          LEFT JOIN "Rating" r2 ON r2."chip_id" = c2.id
          WHERE c2.location->>'country' = ${chipLocation.country}
            AND r2.score IS NOT NULL
        ) AS totalCount
      FROM ranked_chips rc
      WHERE rc."chipId" = ${chipId};
    `;
  }

  if (chipLocation?.city) {
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
        WHERE c.location->>'city' = ${chipLocation.city}
        GROUP BY c.id
      )
      SELECT
        rc.rank,
        (
          SELECT COUNT(DISTINCT c2.id)
          FROM "Chip" c2
          LEFT JOIN "Rating" r2 ON r2."chip_id" = c2.id
          WHERE c2.location->>'city' = ${chipLocation.city}
            AND r2.score IS NOT NULL
        ) AS totalCount
      FROM ranked_chips rc
      WHERE rc."chipId" = ${chipId};
    `;
  }

  return {
    reviews,
    ratingStats,
    rankingResult,
    chipLocation,
    rankingCountry,
    rankingCity,
  };
}