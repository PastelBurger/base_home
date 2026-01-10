import { Category } from '@/data/links';
import LinkCard from './LinkCard';

interface CategorySectionProps {
  category: Category;
}

export default function CategorySection({ category }: CategorySectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <h2 className="text-xl font-semibold text-white">
          {category.name}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {category.links.map((link) => (
          <LinkCard
            key={link.id}
            name={link.name}
            url={link.url}
            color={category.color}
          />
        ))}
      </div>
    </section>
  );
}
