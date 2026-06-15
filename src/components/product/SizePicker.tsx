"use client";

type Variant = {
  id: string;
  size: string;
  stock: number;
};

export function SizePicker({
  variants,
  selectedVariantId,
  onSelect,
}: {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}) {
  const sizes = [...new Set(variants.map((v) => v.size))];
  const selected = variants.find((v) => v.id === selectedVariantId);

  function pickSize(size: string) {
    const match = variants.find((v) => v.size === size && v.stock > 0);
    if (match) onSelect(match.id);
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-primary">Size</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const hasStock = variants.some((v) => v.size === size && v.stock > 0);
          const isActive = selected?.size === size;
          return (
            <button
              key={size}
              type="button"
              disabled={!hasStock}
              onClick={() => pickSize(size)}
              className={`min-w-[3rem] border px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 text-primary hover:border-primary"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
