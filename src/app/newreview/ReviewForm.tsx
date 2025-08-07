'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Rating } from 'react-simple-star-rating';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

const { Title } = Typography;

interface ReviewFormProps {
  userId: string;
}

interface ReviewFormValues {
  chip: string;
  image: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  title: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ userId }) => {
  const [form] = Form.useForm<ReviewFormValues>();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [reviewContent, setReviewContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  };

  const { quill, quillRef } = useQuill({ modules });

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        const html = quillRef.current?.firstChild?.innerHTML;
        setReviewContent(html || '');
      });
    }
  }, [quill, quillRef]);

  const handleFinish = async (values: ReviewFormValues) => {
    if (!userId) {
      message.error('You must be signed in to submit a review.');
      return;
    }

    if (!reviewContent || reviewContent === '<p><br></p>') {
      message.error('Please enter your review.');
      return;
    }

    setLoading(true);

    const payload = {
      ...values,
      review: reviewContent,
      userId,
    };

    try {
      const response = await fetch('/api/newrestaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      message.success('Review submitted successfully! Please wait for it to be approved.');
      form.resetFields();
      setReviewContent('');
      setImageUrl('');
      if (quill) quill.setText('');
    } catch (err) {
      console.error(err);
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-4/6 mx-auto mt-10 p-4 bg-white rounded shadow">
      <Title level={2}>Submit a Restaurant</Title>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <p>
          Please make sure that this restaurant does not already exist. If you submit a restaurant that already exists, your review <strong>will</strong> be removed.
        </p>

        <Form.Item
          label="Restaurant Name"
          name="chip"
          rules={[{ required: true, message: 'Please enter the name of the restaurant' }]}
        >
          <Input placeholder="e.g. Pizza Palace" />
        </Form.Item>

        <Form.Item
          label="Image URL"
          name="image"
          rules={[{ required: true, message: 'Please enter an image URL' }]}
        >
          <Input
            placeholder="https://example.com/image.jpg"
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </Form.Item>

        {imageUrl && (
          <div style={{ marginBottom: 16 }}>
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </div>
        )}

        <Form.Item
          label="Street address"
          name="address"
          rules={[{ required: true, message: 'Please enter an address' }]}
        >
          <Input placeholder="Street address" />
        </Form.Item>

        <Form.Item
          label="City"
          name="city"
          rules={[{ required: true, message: 'Please enter a city' }]}
        >
          <Input placeholder="City" />
        </Form.Item>

        <Form.Item
          label="Country"
          name="country"
          rules={[{ required: true, message: 'Please enter a country' }]}
        >
          <Input placeholder="Country" />
        </Form.Item>

        <Form.Item
          label="Rating"
          name="rating"
          rules={[{ required: true, message: 'Please select a rating' }]}
        >
          <div style={{ display: 'inline-flex', gap: 8 }}>
            <Rating
              onClick={(value: number) => form.setFieldsValue({ rating: value })}
              size={30}
              allowFraction={false}
              initialValue={0}
              className="rating-stars"
            />
          </div>
        </Form.Item>


        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Title" />
        </Form.Item>

        <Form.Item label="Your Review" required>
          <div ref={quillRef} style={{ height: 200, marginBottom: 40 }} />
          {reviewContent === '' && (
            <div style={{ color: 'red', marginTop: '-30px' }}>
              Please enter your review.
            </div>
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Review
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReviewForm;
