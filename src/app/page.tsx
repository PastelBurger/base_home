import Header from '@/components/Header';
import CategorySection from '@/components/CategorySection';
import { categories } from '@/data/links';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <Header />
        <main className="px-4 py-8">
          {categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </main>
        <footer className="py-6 px-4 text-center text-slate-500 text-sm border-t border-slate-800">
          IP Link Partners Internal Portal
        </footer>
      </div>
    </div>
  );
}
