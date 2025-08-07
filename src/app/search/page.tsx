// app/search/page.tsx
import SearchPageClient from './SearchPageClient';
import { searchRestaurantsByName } from '@/lib';
export default async function SearchPage({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams.query || '';

  const restaurants = await searchRestaurantsByName(query);

  return <SearchPageClient query={query} restaurants={restaurants} />;
}

