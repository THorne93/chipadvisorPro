import Image from "next/image";
import { getSession, login, logout, getLatestReviews, getStats } from "../../lib";
import ReviewList from "./components/ReviewList";
import React, { Suspense } from 'react';
import FrontPageStats from "./components/FrontPageStats";


export default async function Home() {
  const session = await getSession();
  const reviews = await getLatestReviews(10);
  const stats = await getStats();
  return (
    <div>
      <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="sm:w-3/4 w-full flex flex-col sm:flex-row items-center gap-4 mb-4 mx-auto sm:mb-0">
          <div className='sm:w-1/6 w-full flex '>
            <img className="h-36 w-36 mx-auto rounded-full"
              src="/assets/img/chiplogo.jpg" />
          </div>
          <div className="w-5/6 flex flex-col text-gray-700 text-base sm:text-lg leading-relaxed">
            <h1 className="text-2xl mb-2 sm:text-3xl md:text-4xl font-bold text-gray-800">
              Welcome to Chip Advisor
            </h1>
            <p className=' mb-2'>
              ChipAdvisor is a place where aficionados of potatoes can get together to find - or create - the perfect chip.
            </p>


          </div>
        </div>
      </div>
      {/* I need a front page stats component and a list component (that features in every slug) */}
      <Suspense fallback={<div className="text-center p-10">Loading stats...</div>}>
        <FrontPageStats {...stats} />
      </Suspense>
      <div className="mt-10 mx-auto w-3/4">

        <h2 className="text-xl text-center sm:text-left font-semibold text-gray-800">Latest Reviews</h2>
        <Suspense fallback={<div className="text-center p-10">Loading reviews...</div>}>

          <ReviewList reviews={reviews} />
        </Suspense>
      </div>
    </div>
  );
}
