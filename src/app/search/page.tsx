import { Suspense } from 'react';
import { SearchWidget } from '@/components/search/SearchWidget';
import { SearchResults } from './SearchResults';

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <SearchWidget />
      </div>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-slate-200/60" />}>
        <SearchResults />
      </Suspense>
    </main>
  );
}
