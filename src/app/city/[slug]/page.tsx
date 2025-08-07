import { prisma } from "@/lib/prisma";
import { getCityChips, getCityRank, getCityRating } from "@/lib";
import CountryList from "../../components/CountryList";
import React, { Suspense } from 'react';


type Params = Promise<{ slug: string }>
export default async function CityPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [rawReviews, cityRank, cityRating] = await Promise.all([
    getCityChips(slug),
    getCityRank(slug),
    getCityRating(slug),
  ]);

  // @ts-ignore
  const reviews = rawReviews.map((r: any) => ({
    ...r,
    average_rating: Number(r.average_rating),
    total_ratings: Number(r.total_ratings),
  }));
  console.log(reviews)
  const actualParams = await params;
  const readableCity = actualParams.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <div className="mt-2 border border-black mx-auto w-3/4 rounded-md">
      <div className="my-2 px-4">
        <h1 className="text-3xl py-1 font-bold">{readableCity}</h1>

        <dl className="text-xl space-y-1">
          <div className="flex">
            <dt className="font-semibold">Average Rating:{'\u00A0'}</dt>

            // @ts-ignore
            <dd className="ml-2">{cityRating[0]?.average_city_score ?? 0} / 5</dd>
          </div>
          <div className="flex">
            <dt className="font-semibold">Total Reviews:{'\u00A0'}</dt>
            <dd className="ml-2">{reviews.length}</dd>
          </div>
          <div className="flex">
            <dt className="font-semibold">World Ranking:{'\u00A0'}</dt>
            <dd className="ml-2">
              
              // @ts-ignore
              {Number(cityRank[0]?.rank) ?? 0} / {Number(cityRank[0]?.total_cities) ?? 0}
            </dd>
          </div>
        </dl>

      </div>
      <Suspense fallback={<div className="text-center p-10">Loading reviews...</div>}>

        <CountryList reviews={reviews} />
      </Suspense>
    </div>
  );
}
