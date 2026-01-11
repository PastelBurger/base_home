import { Category } from '@/data/links';
import LinkCard from './LinkCard';

interface CategorySectionProps {
  category: Category;
}

export default function CategorySection({ category }: CategorySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-1.5 h-7 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <h2 className="text-xl font-semibold text-gray-900">
          {category.name}
        </h2>
        <span className="text-sm text-gray-400">
          {category.links.length}개
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {category.links.map((link) => (
          <LinkCard
            key={link.id}
            name={link.name}
            url={link.url}
            color={category.color}
            highlighted={link.highlighted}
          />
        ))}
      </div>
    </section>
  );
}
