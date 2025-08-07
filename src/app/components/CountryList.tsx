'use client';
import React, { useEffect, useState } from 'react';
import { Button, Radio } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Rating } from 'react-simple-star-rating';
import slugify from 'slugify';
import Link from 'next/link';

export default function CountryList({ reviews: initialReviews }: { reviews: any[] }) {
    const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'review' | 'rating' | 'ratings'>('review');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [sortedReviews, setSortedReviews] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 10;

    const sortOptions = [
        { label: 'latest review', value: 'review' },
        { label: 'rating', value: 'rating' },
        { label: 'nº ratings', value: 'ratings' },
    ];

    const sortReviews = () => {
        let sorted = [...initialReviews];
        if (sortBy === 'review') {
            sorted.sort((a, b) => new Date(b.latest_review).getTime() - new Date(a.latest_review).getTime());
        } else if (sortBy === 'rating') {
            sorted.sort((a, b) => b.average_rating - a.average_rating);
        } else if (sortBy === 'ratings') {
            sorted.sort((a, b) => b.total_ratings - a.total_ratings);
        }

        if (order === 'asc') {
            sorted.reverse();
        }

        setSortedReviews(sorted);
    };

    useEffect(() => {
        sortReviews();
    }, [sortBy, order, initialReviews]);

    const toggleOrder = () => {
        setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    if (!initialReviews || initialReviews.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[200px] text-gray-500">
                No reviews yet.
            </div>
        );
    }
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = sortedReviews.slice(startIndex, endIndex);

    const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-end m-4 gap-2 sm:gap-0">
                <div className="flex items-center mr-4">
                    <span className="text-gray-800">Sort by</span>
                </div>
                <Radio.Group
                    className="mx-2"
                    options={sortOptions}
                    value={sortBy}
                    optionType="button"
                    onChange={(e) => setSortBy(e.target.value)}
                />
                {order === 'desc' ? (
                    <DownOutlined className="cursor-pointer px-1" onClick={toggleOrder} />
                ) : (
                    <UpOutlined className="cursor-pointer px-1" onClick={toggleOrder} />
                )}
            </div>


            <ul className="divide-y divide-gray-200">
                {currentReviews.map((review: any) => {
                    const isExpanded = expandedReviewId === review.id;
                    const slugChip = slugify(`${review?.name}--${review?.id}`);
                    const location = review?.location || {};
                    const slugCountry = slugify(location?.country);

                    return (
                        <li
                            key={review.id}
                            className="w-full bg-gray-100 my-4 rounded-lg p-4 flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 shadow-sm"
                        >
                            <div className="flex-shrink-0 w-32 h-32 rounded-md overflow-hidden mx-auto sm:mx-0 mb-4 sm:mb-0">
                                {review?.img_url ? (
                                    <img
                                        src={review.img_url}
                                        alt="Chip Image"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                                        <span>No Image</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 sm:ml-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
                                    <div className="text-gray-900 flex flex-col text-lg sm:text-2xl font-bold">
                                        <Link href={`/chip/${slugChip}`} className="hover:underline">
                                            {review?.name}
                                        </Link>
                                        <div className="inline-flex items-center leading-none">
                                            <span className="text-sm text-gray-700 mr-2">Average rating</span>
                                            <Rating
                                                key={review?.average_rating}
                                                readonly
                                                size={20}
                                                initialValue={Number(review?.average_rating || 0)}
                                                className="rating-stars !inline-flex !p-0 !gap-0"
                                                style={{
                                                    display: 'inline-flex',
                                                    gap: 0,
                                                    lineHeight: 1,
                                                    transform: 'translateY(-4px)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col text-left sm:text-right text-gray-600 text-sm ml-0 sm:ml-4 mt-2 sm:mt-0">
                                        {location?.city ? (
                                            <>
                                                <div className="text-base">
                                                    <Link
                                                        href={`/city/${slugify(location.city)}`}
                                                        className="hover:underline"
                                                    >
                                                        {location.city}
                                                    </Link>
                                                    ,{" "}
                                                    <Link
                                                        href={`/country/${slugCountry}`}
                                                        className="hover:underline"
                                                    >
                                                        {location?.country}
                                                    </Link>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {location.address}
                                                </div>
                                            </>
                                        ) : (
                                            <div>Invalid location</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm text-gray-500">Most recent review:</span>
                                    <div
                                        className={`text-gray-700 relative transition-all duration-300 ease-in-out ${isExpanded ? "" : "max-h-12 overflow-hidden"}`}
                                        dangerouslySetInnerHTML={{ __html: review?.content }}
                                    />
                                    {review?.content?.length > 160 && (
                                        <button
                                            className="text-black w-full cursor-pointer text-sm hover:underline"
                                            onClick={() => setExpandedReviewId(isExpanded ? null : review.id)}
                                        >
                                            {isExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <div className="flex justify-center items-center mt-4 gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    Previous
                </button>

                <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

        </div>
    );
}
