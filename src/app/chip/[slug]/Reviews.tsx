'use client';

import React, { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import slugify from 'slugify';
import { Review, Chip, Rating as Score } from '@prisma/client';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Radio, message } from 'antd';

type ExtendedReview = Review & {
  chip: Chip;
  rating: Score | null;
  author: { username: string };
};

type ReviewsProps = {
  reviews: ExtendedReview[];
  isAdmin: boolean;
};

export default function Reviews({ reviews, isAdmin }: ReviewsProps) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  const toggleOrder = () => {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortOptions = [
    { label: 'Date', value: 'date' },
    { label: 'Rating', value: 'rating' },
  ];

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      message.success('Review deleted');

      setLocalReviews((prev) => prev.filter((r) => r.id !== id));

      if (expandedReviewId === id) {
        setExpandedReviewId(null);
      }
    } catch (error) {
      console.error(error);
      message.error('Error deleting review');
    }
  }

  const sortedReviews = [...localReviews].sort((a, b) => {
    let result = 0;

    if (sortBy === 'date') {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      result = aDate - bDate;
    } else if (sortBy === 'rating') {
      const aRating = a.rating?.score ?? 0;
      const bRating = b.rating?.score ?? 0;
      result = aRating - bRating;
    }

    return order === 'asc' ? result : -result;
  });

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  if (localReviews.length === 0) {
    return <p>No reviews found.</p>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-end m-4 gap-2 sm:gap-0">
        <div className="flex items-center mr-4">
          <span className="text-gray-800">Sort by</span>
          <Radio.Group
            className="mx-2"
            options={sortOptions}
            value={sortBy}
            optionType="button"
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
        {order === 'desc' ? (
          <DownOutlined className="cursor-pointer px-1" onClick={toggleOrder} />
        ) : (
          <UpOutlined className="cursor-pointer px-1" onClick={toggleOrder} />
        )}
      </div>

      <ul>
        {paginatedReviews.map((review) => {
          const isExpanded = expandedReviewId === review.id;
          const location = review.chip.location;
          const slug = slugify(location?.country);

          return (
            <li
              key={review.id}
              className="relative w-full bg-gray-100 my-4 rounded-lg p-4 flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 shadow-sm"
            >
              <div className="flex-1 sm:ml-4">
                <div className="flex flex-row justify-between items-center mb-1 sm:text-2xl text-lg font-bold text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="mt-1 sm:mt-0">{review.title}</div>
                    <Rating
                      className="rating-stars !inline-flex !p-0 !gap-1"
                      readonly
                      size={20}
                      initialValue={Number(review.rating?.score ?? 0)}
                    />
                  </div>

                  <div className="text-gray-600 text-sm font-normal">
                    by <span className="font-semibold">{review.author.username}</span>
                  </div>
                </div>

                <div
                  className={`text-gray-700 relative transition-all duration-300 ease-in-out ${
                    isExpanded ? '' : 'max-h-12 overflow-hidden'
                  }`}
                  dangerouslySetInnerHTML={{ __html: review.content }}
                ></div>

                {review.content.length > 160 && (
                  <button
                    className="text-black w-full cursor-pointer text-sm hover:underline"
                    onClick={() => setExpandedReviewId(isExpanded ? null : review.id)}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(review.id)}
                  className="absolute top-2 right-2 hover:cursor-pointer text-red-600 hover:text-red-800 font-bold text-xl leading-none"
                  aria-label="Delete review"
                  title="Delete review"
                  type="button"
                >
                  ×
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 text-sm border rounded ${
              currentPage === page ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  )
}
