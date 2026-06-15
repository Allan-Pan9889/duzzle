import type { Category } from "@prisma/client";
import { MEN_IMAGE_POOL, WOMEN_IMAGE_POOL } from "./demo-image-pool";

export type DemoCatalogProduct = {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
};

type ProductDef = Omit<DemoCatalogProduct, "imageUrl">;

function item(
  name: string,
  description: string,
  price: number,
  compareAtPrice: number,
): ProductDef {
  return { name, description, price, compareAtPrice };
}

function attachImages(
  defs: ProductDef[],
  pool: readonly string[],
): DemoCatalogProduct[] {
  if (defs.length !== pool.length) {
    throw new Error(
      `Product count (${defs.length}) must match image pool size (${pool.length})`,
    );
  }
  return defs.map((def, index) => ({
    ...def,
    imageUrl: pool[index]!,
  }));
}

const WOMEN_DEFS: ProductDef[] = [
  item("Floral Print A-Line Dress", "Lightweight cotton blend dress with vibrant floral print.", 899, 1299),
  item("High-Waist Wide Leg Trousers", "Relaxed fit trousers with elastic waistband.", 799, 1099),
  item("Ribbed Knit Crop Top", "Soft ribbed fabric, perfect for layering.", 499, 699),
  item("Pleated Midi Skirt", "Flowy pleated skirt with side zip closure.", 699, 999),
  item("Oversized Linen Shirt", "Breathable linen blend, casual everyday wear.", 649, 899),
  item("Wrap Front Blouse", "Elegant wrap design with tie closure.", 549, 799),
  item("High-Neck Bodycon Dress", "Stretch fabric bodycon with high neckline.", 849, 1199),
  item("Denim Jacket with Patch Pockets", "Classic denim jacket with utility pockets.", 1299, 1799),
  item("Tiered Maxi Skirt", "Bohemian tiered skirt in flowing fabric.", 749, 1049),
  item("Square Neck Cami Top", "Minimal square neck cami with adjustable straps.", 399, 599),
  item("Printed Straight Kurta", "Cotton straight kurta with all-over block print.", 699, 999),
  item("Embroidered Anarkali Suit", "Festive anarkali with delicate embroidery.", 1899, 2499),
  item("Palazzo Pants with Belt", "Wide-leg palazzo with matching fabric belt.", 649, 899),
  item("Cotton A-Line Kurti", "Everyday kurti with side slits and round neck.", 549, 799),
  item("Off-Shoulder Ruffle Top", "Romantic off-shoulder top with ruffle hem.", 599, 849),
  item("High-Rise Skinny Jeans", "Stretch denim with clean finish and high rise.", 899, 1299),
  item("Belted Shirt Dress", "Midi shirt dress with removable fabric belt.", 949, 1349),
  item("Embroidered Ethnic Top", "Mirror-work yoke top for festive occasions.", 799, 1149),
  item("Satin Slip Midi Dress", "Bias-cut satin slip dress for evening wear.", 1099, 1599),
  item("Puff Sleeve Blouse", "Statement puff sleeves with pearl buttons.", 649, 949),
  item("Palazzo Kurti Co-ord Set", "Matching kurta and palazzo set in soft rayon.", 1199, 1699),
  item("Ruched Bodycon Mini Dress", "Figure-flattering ruched mini with cap sleeves.", 799, 1149),
  item("Cropped Denim Jacket", "Light-wash cropped denim for layering.", 999, 1399),
  item("Layered Tiered Skirt", "Double-tier skirt with elasticated waist.", 699, 999),
  item("V-Neck Tee Dress", "Casual jersey dress with side pockets.", 549, 799),
  item("Flared Bell Bottom Trousers", "Retro bell bottoms in stretch twill.", 749, 1049),
  item("Lace Trim Camisole", "Delicate lace trim cami for layering.", 449, 649),
  item("Striped Button-Down Shirt", "Crisp cotton shirt with vertical stripes.", 599, 849),
  item("Asymmetric Hem Top", "Modern asymmetric hem in soft crepe.", 499, 749),
  item("Tie-Dye Oversized Tee", "Relaxed tie-dye tee with dropped shoulders.", 449, 649),
  item("Solid Cotton Kurti", "Minimal solid kurti with 3/4 sleeves.", 499, 749),
  item("Georgette Printed Dupatta Set", "Kurta set with lightweight georgette dupatta.", 1399, 1999),
  item("Cropped Hoodie Sweatshirt", "Soft fleece cropped hoodie.", 799, 1149),
  item("High-Waist Paperbag Shorts", "Paperbag waist shorts with tie belt.", 549, 799),
  item("Ribbed Tank Dress", "Sleeveless ribbed knit tank dress.", 599, 849),
  item("Wrap Around Skirt", "Adjustable wrap skirt in printed viscose.", 649, 899),
  item("Knit Cardigan", "Open-front knit cardigan with patch pockets.", 899, 1299),
  item("Scoop Neck Bodysuit", "Stretch bodysuit with snap closure.", 499, 749),
  item("Cargo Utility Skirt", "Mini cargo skirt with flap pockets.", 599, 849),
  item("Pleated A-Line Maxi Dress", "Elegant pleated maxi for day-to-night.", 1199, 1699),
];

const MEN_DEFS: ProductDef[] = [
  item("Slim Fit Cotton Shirt", "Classic slim fit shirt in premium cotton.", 699, 999),
  item("Tapered Chino Pants", "Smart casual chinos with stretch comfort.", 899, 1299),
  item("Graphic Print Oversized Tee", "Relaxed fit tee with bold front graphic.", 449, 649),
  item("Lightweight Bomber Jacket", "Zip-front bomber with ribbed cuffs.", 1499, 1999),
  item("Straight Leg Denim Jeans", "Mid-rise straight leg jeans in dark wash.", 999, 1399),
  item("Polo Collar Knit Polo", "Soft knit polo with contrast collar.", 599, 849),
  item("Cargo Jogger Pants", "Utility cargo joggers with drawstring waist.", 849, 1149),
  item("Henley Long Sleeve Tee", "Casual henley with button placket.", 499, 699),
  item("Quilted Puffer Vest", "Lightweight insulated vest for layering.", 1199, 1599),
  item("Relaxed Fit Linen Shorts", "Breathable linen shorts for summer.", 549, 799),
  item("Classic Oxford Cotton Shirt", "Formal oxford weave shirt for office wear.", 799, 1149),
  item("Slim Fit Formal Trousers", "Tailored trousers with flat front.", 999, 1399),
  item("Printed Casual Shirt", "Short-sleeve resort shirt with tropical print.", 649, 949),
  item("Regular Fit Denim Jeans", "Comfort fit jeans with mild fade.", 899, 1299),
  item("Round Neck Basic Tee", "Essential cotton tee in solid colours.", 349, 499),
  item("Checkered Flannel Shirt", "Brushed flannel shirt for casual weekends.", 749, 1049),
  item("Stretch Chino Shorts", "Above-knee chino shorts with stretch.", 599, 849),
  item("Mock Neck Sweater", "Fine-knit mock neck sweater.", 899, 1299),
  item("Cargo Utility Shirt", "Dual chest pockets with roll-up sleeves.", 699, 999),
  item("Sports Track Pants", "Tapered track pants with zip pockets.", 649, 899),
  item("Linen Blend Casual Shirt", "Breathable linen shirt for hot weather.", 749, 1049),
  item("Distressed Slim Jeans", "Slim jeans with light distressing.", 1099, 1549),
  item("Polo T-Shirt with Contrast Collar", "Pique polo with colour-block collar.", 649, 899),
  item("Hooded Pullover Sweatshirt", "Fleece hoodie with kangaroo pocket.", 899, 1299),
  item("Tailored Blazer", "Single-breasted blazer for smart occasions.", 2499, 3499),
  item("Jogger Pants with Zip Pockets", "Athleisure joggers in cotton blend.", 799, 1149),
  item("Vertical Stripe Shirt", "Slim stripe shirt with spread collar.", 699, 999),
  item("Crew Neck Sweater Vest", "Knitted vest for layered looks.", 799, 1149),
  item("Relaxed Fit Kurta", "Cotton kurta with mandarin collar.", 699, 999),
  item("Nehru Jacket Vest", "Structured Nehru jacket for ethnic wear.", 1299, 1799),
  item("Printed Resort Shirt", "Relaxed camp-collar shirt for vacations.", 649, 949),
  item("Skinny Fit Black Jeans", "Jet black skinny jeans with stretch.", 949, 1349),
  item("Longline T-Shirt", "Extended hem tee with side slits.", 449, 649),
  item("Windbreaker Jacket", "Lightweight packable windbreaker.", 1199, 1699),
  item("Flat Front Formal Trousers", "Office-ready trousers with crease front.", 899, 1299),
  item("Henley Short Sleeve Top", "Summer henley in soft jersey.", 399, 599),
  item("Gym Training Tee", "Moisture-wicking performance tee.", 499, 749),
  item("Dual-Tone Polo Shirt", "Colour-block polo with ribbed cuffs.", 699, 999),
  item("Cotton Casual Shorts", "Mid-thigh shorts with elastic waist.", 499, 749),
  item("Quilted Winter Jacket", "Insulated quilted jacket with stand collar.", 1799, 2499),
];

export const DEMO_WOMEN_PRODUCTS = attachImages(WOMEN_DEFS, WOMEN_IMAGE_POOL);
export const DEMO_MEN_PRODUCTS = attachImages(MEN_DEFS, MEN_IMAGE_POOL);

export function getDemoCatalog(category: Category): DemoCatalogProduct[] {
  return category === "WOMEN" ? DEMO_WOMEN_PRODUCTS : DEMO_MEN_PRODUCTS;
}

export function getAllDemoCatalogProducts(): DemoCatalogProduct[] {
  return [...DEMO_WOMEN_PRODUCTS, ...DEMO_MEN_PRODUCTS];
}

export function validateDemoCatalogImages(): void {
  const urls = getAllDemoCatalogProducts().map((p) => p.imageUrl);
  const unique = new Set(urls);
  if (unique.size !== urls.length) {
    const dupes = urls.filter((u, i) => urls.indexOf(u) !== i);
    throw new Error(`Duplicate catalog image URLs: ${[...new Set(dupes)].join(", ")}`);
  }
}

validateDemoCatalogImages();
