'use client';
import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { Rating } from 'react-simple-star-rating';
import QuillReview from './QuillReview';

type SessionUser = {
  id: number;
  email?: string;
  name?: string;
  role?: string;
};

type NewReviewProps = {
  chipId: number;
  userId: number | null; // add this line
};

export default function NewReview({ chipId, userId }: NewReviewProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [quillInstance, setQuillInstance] = useState<any>(null); // You can type this better if Quill is typed



  const handleSubmit = async () => {
    if (!title || !content || rating === 0) {
      message.error('Please provide a title, rating, and review content.');
      return;
    }

    setLoading(true);

    const payload = {
      chip_id: chipId,
      user_id: userId,
      title,
      content,
      rating,
    };

    try {
      const response = await fetch('/api/newreview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      message.success('Review submitted successfully!');
      window.location.reload();
      setTitle('');
      setRating(0);
      setContent('');
      if (quillInstance) quillInstance.setText('');
    } catch (err) {
      console.error(err);
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  px-4">
      {userId ? (
        <>

          <div className="inline-flex items-center gap-2 py-2 w-full">
            <div style={{ display: 'inline-flex', gap: 8 }}>
              <Rating
                onClick={setRating}
                initialValue={rating} size={30}
                allowFraction={false}
                className="rating-stars"
              />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review title"
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          <QuillReview
            onContentChange={setContent}
            onQuillInit={setQuillInstance}
          />

          <Button
            type="primary"
            className="mt-4"
            onClick={handleSubmit}
            loading={loading}
          >
            Submit Review
          </Button>
        </>
      ) : (
        <div>Sign in to write a review</div>
      )}
    </div>
  );
}
