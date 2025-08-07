// app/newreview/page.tsx
import { getSession } from '@/lib';
import ReviewForm from './ReviewForm';

export default async function NewReviewPage() {
  const session = await getSession();

  if (!session) {
    // Redirect or show a not-logged-in message
    return <div>You must be logged in to submit a review.</div>;
  }

    return <ReviewForm userId={session.user.id} />;
}
