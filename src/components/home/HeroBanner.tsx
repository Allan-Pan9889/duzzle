import Image from "next/image";
import Link from "next/link";
import { isLocalDemoAsset } from "@/lib/utils";

const slides = [
  {
    title: "New Season Essentials",
    subtitle: "Discover timeless pieces for every occasion",
    href: "/new-arrivals",
    image: "/demo/home/hero-new-season.jpg",
  },
  {
    title: "Women's Collection",
    subtitle: "Elegant styles, fair prices",
    href: "/women",
    image: "/demo/home/hero-women.jpg",
  },
  {
    title: "Men's Collection",
    subtitle: "Refined looks for the modern wardrobe",
    href: "/men",
    image: "/demo/home/hero-men.jpg",
  },
];

export function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[21/8] w-full max-h-[min(42vh,420px)] min-h-[220px] sm:aspect-[21/7]">
        <Image
          src={slides[0].image}
          alt={slides[0].title}
          fill
          unoptimized={isLocalDemoAsset(slides[0].image)}
          className="object-cover grayscale"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <h2 className="font-serif text-2xl tracking-wide sm:text-4xl">
            {slides[0].title}
          </h2>
          <p className="mt-3 max-w-md text-sm text-gray-200 sm:text-base">
            {slides[0].subtitle}
          </p>
          <Link
            href={slides[0].href}
            className="mt-6 border border-white px-8 py-3 text-sm tracking-wide transition-colors hover:bg-white hover:text-primary"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
