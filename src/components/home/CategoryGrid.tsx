import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    href: "/women",
    label: "Women",
    image: "/demo/home/category-women.jpg",
  },
  {
    href: "/men",
    label: "Men",
    image: "/demo/home/category-men.jpg",
  },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center font-serif text-2xl tracking-wide text-primary">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative aspect-[4/5] overflow-hidden bg-surface"
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105 grayscale"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
            <span className="absolute bottom-6 left-6 font-serif text-2xl tracking-wide text-white">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
