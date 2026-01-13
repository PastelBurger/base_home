import Header from '@/components/Header';
import CategorySection from '@/components/CategorySection';
import UrgentDeadlines from '@/components/UrgentDeadlines';
import { categories } from '@/data/links';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <Header />
        <main className="px-6 pb-12">
          <div className="bg-[#f8fafa] rounded-2xl p-8">
            <UrgentDeadlines />
            {categories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        </main>
        <footer className="py-8 px-4 text-center text-gray-400 text-sm">
          <p>IP Link Partners Internal Portal</p>
        </footer>
      </div>
    </div>
  );
}
