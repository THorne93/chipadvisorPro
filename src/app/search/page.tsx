// app/search/page.tsx
import SearchPageClient from './SearchPageClient';
import { searchRestaurantsByName } from '@/lib';

type SearchParams = Promise<{ query?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params.query || '';

  const restaurants = await searchRestaurantsByName(query);

  return <SearchPageClient query={query} restaurants={restaurants} />;
}

