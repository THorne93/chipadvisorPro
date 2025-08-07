'use client';

import React from 'react';
import slugify from 'slugify';
import Link from 'next/link';

export default function SearchPageClient({ query, restaurants }) {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Search Results for: {query}</h1>

            {restaurants.length === 0 && <div>No restaurants found.</div>}

            <div className="space-y-6">
                {restaurants.map((rest: any) => {
                    const location = rest?.location || {};
                    const slugChip = `${slugify(rest.name, { lower: true })}--${rest.id}`;
                    const slugCity = slugify(location?.city || '');
                    const slugCountry = slugify(location?.country || '');

                    return (
                        <div
                            key={rest.id}
                            className="flex flex-col sm:flex-row items-start bg-white shadow-md rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-300"
                        >
                            <img
                                src={rest.image}
                                alt={rest.name}
                                className="w-full sm:w-40 h-32 sm:h-32 object-cover rounded-md flex-shrink-0"
                                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                            />
                            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                                <Link href={`/chip/${slugChip}`} className="text-xl font-semibold hover:underline">{rest.name}</Link>
                                <div className="mt-2 text-gray-600 space-y-1">
                                    <Link href={`/city/${slugCity}`} className="hover:underline">{location.city}</Link>,{' '}
                                    <Link href={`/country/${slugCountry}`} className="hover:underline">{location.country}</Link>
                                </div>
                                <div className="text-sm text-gray-500">{location.address}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
