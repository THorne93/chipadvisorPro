import Reviews from './Reviews';
import NewReview from './NewReview';
import Link from 'next/link';
import slugify from 'slugify';

import { getSession, getChipData } from '@/lib';

export default async function ChipPage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  const isAdmin = session?.user.role === 'ADMIN';
  const userId = session?.user?.id || null;

  const { slug } = params;
  const [slugNamePart, idPart] = slug.split('-');
  const chipId = parseInt(idPart, 10);
  const readableChip = slugNamePart.replace(/-/g, ' ');

  const {
    reviews,
    ratingStats,
    rankingResult,
    chipLocation,
    rankingCountry,
    rankingCity,
  } = await getChipData(chipId);

  const country = chipLocation?.country ?? '';
  const city = chipLocation?.city ?? '';
  const slugCity = city ? slugify(city) : '';
  const slugCountry = country ? slugify(country) : '';

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
                  {chipLocation?.address},&nbsp;
                  <Link href={`/city/${slugCity}`} className="hover:underline">
                    {city}
                  </Link>
                  ,&nbsp;
                  <Link href={`/country/${slugCountry}`} className="hover:underline">
                    {country}
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="text-xl text-gray-700">Average Score</td>
                <td className="text-xl text-gray-700">
                  {averageScore !== null ? `${averageScore.toFixed(2)} / 5` : 'No ratings yet'}
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
      <div className="w-full flex flex-col sm:flex-row my-4 pb-32">
        {/* Left Column */}
        <div className="w-full flex flex-col">
          <h2 className="text-2xl font-bold px-4 mb-4">Write a Review</h2>
          <NewReview chipId={chipId} userId={userId} />
        </div>

        {/* Right Column */}
        <div className="w-full flex flex-col">
          <h2 className="text-2xl font-bold px-4 mb-4">Reviews</h2>
          <Reviews reviews={reviews} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
