"use client";

import Image from "next/image";
import { useState } from "react";
import { isLocalDemoAsset } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : ["/duzzlecode.png"];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <Image
          src={gallery[active]}
          alt={name}
          fill
          unoptimized={isLocalDemoAsset(gallery[active])}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {gallery.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden border-2 ${
                i === active ? "border-primary" : "border-transparent"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                unoptimized={isLocalDemoAsset(img)}
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
