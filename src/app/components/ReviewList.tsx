'use client';
import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react'; // ✅ added useEffect
import slugify from 'slugify';
import Link from 'next/link';
import { Rating } from 'react-simple-star-rating';
import {
    XOutlined,
    InstagramOutlined,
    FacebookOutlined,
    MailOutlined,
} from '@ant-design/icons';

export default function ReviewList({ reviews }: { reviews: any }) {
    const [expandedReviewId, setExpandedReviewId] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null; // 👈 prevent initial render

    if (!reviews || reviews.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[200px] text-gray-500">
                No reviews yet.
            </div>
        );
    }
    return (
        <ul className="divide-y divide-gray-200">

            {reviews.map((review: any) => {
                const isExpanded = expandedReviewId === review.id;

                return (

                    <li
                        key={review.id}
                        className="w-full bg-gray-100 my-4 rounded-lg p-4 flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 shadow-sm"
                    >
                        <div className="flex-shrink-0 w-32 h-32 rounded-md overflow-hidden mx-auto sm:mx-0 mb-4 sm:mb-0">
                            {review?.chip?.img_url ? (
                                <img
                                    src={review?.chip?.img_url}
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
                                    <div className="mt-1">{review.title}</div>
                                    <div
                                        className="inline-flex items-center leading-none"
                                        style={{ verticalAlign: 'middle' }}
                                    >
                                        <Rating
                                            key={review.rating?.score}
                                            readonly
                                            size={20}
                                            initialValue={review.rating ? Number(review.rating.score) : 0}
                                            className="rating-stars !inline-flex !p-0 !gap-0"
                                            style={{
                                                display: 'inline-flex',
                                                gap: 0,
                                                lineHeight: 1,
                                            }}
                                        />
                                    </div>




                                </div>


                                <div className="flex flex-col text-left sm:text-right text-gray-600 text-sm ml-0 sm:ml-4 mt-2 sm:mt-0">                                    {(() => {
                                    try {
                                        const location = review?.chip?.location;
                                        const slugChip = slugify(
                                            `${review?.chip?.name}--${review?.chip?.id}`
                                        );
                                        const slugCity = slugify(location?.city);
                                        const slugCountry = slugify(location?.country);
                                        return (
                                            <>
                                                <div className="text-base">
                                                    <Link
                                                        href={`/chip/${slugChip}`}
                                                        className="hover:underline"
                                                    >
                                                        {review?.chip?.name}
                                                    </Link>
                                                    ,{" "}
                                                    <Link
                                                        href={`/city/${slugCity}`}
                                                        className="hover:underline"
                                                    >
                                                        {location?.city}
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
                                                    {location?.address}
                                                </div>
                                            </>
                                        );
                                    } catch (e) {
                                        return <div>Invalid location</div>;
                                    }
                                })()}
                                </div>
                            </div>

                            <div
                                className={`text-gray-700 relative transition-all duration-300 ease-in-out ${isExpanded ? "" : "max-h-12 overflow-hidden"
                                    }`}
                                dangerouslySetInnerHTML={{ __html: review?.content }}
                            ></div>

                            {review?.content.length > 160 && (
                                <button
                                    className="text-black w-full cursor-pointer text-sm hover:underline"
                                    onClick={() =>
                                        setExpandedReviewId(isExpanded ? null : review.id)
                                    }
                                >
                                    {isExpanded ? "Show less" : "Show more"}
                                </button>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
