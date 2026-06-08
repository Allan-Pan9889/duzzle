"use client";

type Variant = {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
};

export function SizeColorPicker({
  variants,
  selectedVariantId,
  onSelect,
}: {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}) {
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Map(variants.map((v) => [v.color, v.colorHex])).entries()];

  const selected = variants.find((v) => v.id === selectedVariantId);

  function pickSize(size: string) {
    const match = variants.find((v) => v.size === size && v.stock > 0);
    if (match) onSelect(match.id);
  }

  function pickColor(color: string) {
    const size = selected?.size ?? sizes.find((s) => variants.some((v) => v.size === s && v.stock > 0));
    if (!size) return;
    const match = variants.find((v) => v.size === size && v.color === color && v.stock > 0);
    if (match) onSelect(match.id);
  }

  return (
    <div className="space-y-6">
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

      <div>
        <p className="mb-3 text-sm font-medium text-primary">Color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map(([color, hex]) => {
            const hasStock = variants.some((v) => v.color === color && v.stock > 0);
            const isActive = selected?.color === color;
            return (
              <button
                key={color}
                type="button"
                disabled={!hasStock}
                onClick={() => pickColor(color)}
                className={`flex items-center gap-2 border px-4 py-2 text-sm transition-colors ${
                  isActive ? "border-primary" : "border-gray-200 hover:border-primary"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
                {color}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
