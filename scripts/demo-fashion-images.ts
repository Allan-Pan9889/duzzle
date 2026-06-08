/**
 * Curated Myntra (Indian e-commerce) product images for demo catalog.
 * Sources: public Myntra CDN assets (assets.myntassets.com).
 * Urbanic scraping is geo-blocked; these images match Indian fast-fashion style.
 */

export const MYNT_REFERER = "https://www.myntra.com/";

/** slug -> primary product image URL */
export const DEMO_FASHION_IMAGE_CATALOG: Record<string, string> = {
  // Women
  "floral-print-a-line-dress":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/12/016671aa-1f0d-4606-972a-81c8a47cec7c1560361299556-1.jpg",
  "high-waist-wide-leg-trousers":
    "http://assets.myntassets.com/assets/images/10009723/2019/7/4/8156a265-8d11-4f91-b571-2ad632eb584f1562241896870-SPYKAR-Women-Blue-Skinny-Fit-Mid-Rise-Clean-Look-Stretchable-1.jpg",
  "ribbed-knit-crop-top":
    "http://assets.myntassets.com/assets/images/4033993/2018/3/14/11521023495997-na-7501521023495682-1.jpg",
  "pleated-midi-skirt":
    "http://assets.myntassets.com/assets/images/10001251/2019/11/7/37d94783-88a0-4b13-ba92-d97b441aa35b1573109836634-Black-Tulip-Skirt-3981573109834761-1.jpg",
  "oversized-linen-shirt":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/13/d749c6f3-3f27-485b-a1ea-849d2cc6c7551560384009508-1.jpg",
  "wrap-front-blouse":
    "http://assets.myntassets.com/assets/images/4033590/2018/3/14/11521012081187-NA-7551521012081000-2.jpg",
  "high-neck-bodycon-dress":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/13/4ad97a5f-45e9-49fd-85ae-0279db9ed7971560398300505-1.jpg",
  "denim-jacket-with-patch-pockets":
    "http://assets.myntassets.com/assets/images/10003387/2019/6/17/a9b1138a-569e-4572-a4ad-ad0b98211f5e1560763863792-Gini-and-Jony-Girls-Navy-Blue-Solid-Jacket-8921560763862756-1.jpg",
  "tiered-maxi-skirt":
    "http://assets.myntassets.com/assets/images/10001251/2019/11/7/a42c2b51-e795-4f7d-af06-5716ccbd42101573109836596-Black-Tulip-Skirt-3981573109834761-2.jpg",
  "square-neck-cami-top":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/13/fa8c0abf-1722-45e5-b2ba-c97cd77e50911560398300544-2.jpg",

  // Men
  "slim-fit-cotton-shirt":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/13/64a02de5-be6e-4749-8cf8-4a5690da9ccd1560405868743-1.jpg",
  "tapered-chino-pants":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/12/925f5115-c40c-4177-bc63-98b0b7f9f42e1560301313659-1.jpg",
  "graphic-print-oversized-tee":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/13/1868325d-870d-4e2f-bff2-2374969c49b41560388616822-1.jpg",
  "lightweight-bomber-jacket":
    "http://assets.myntassets.com/assets/images/10002181/2019/10/3/fcce0ccb-8f57-4bac-9e73-0b8f855c427c1570081641968-US-Polo-Assn-Denim-Co-Men-Navy-Blue-Solid-Bomber-Jacket-8951-1.jpg",
  "straight-leg-denim-jeans":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/12/f42cc3c7-3b67-4e49-8c8f-2c78828f04ca1560315793075-1.jpg",
  "polo-collar-knit-polo":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/12/5a7909f8-30b3-4ade-bd8c-e1719a64fa581560302137879-1.jpg",
  "cargo-jogger-pants":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/13/0ffce1b0-0a88-4ca2-8caa-e35161cfc44c1560397564626-1.jpg",
  "henley-long-sleeve-tee":
    "http://assets.myntassets.com/assets/images/10005903/2020/2/12/0083a06a-1add-41cc-bc2e-d15d52d4ea4c1581508463267-Difference-of-Opinion-Men-Navy-Blue-Solid-Round-Neck-T-shirt-1.jpg",
  "quilted-puffer-vest":
    "http://assets.myntassets.com/assets/images/10003299/2019/6/17/dc8976cc-7d40-4c29-b6f0-2145d46b965e1560763759225-Gini-and-Jony-Boys-Red-Solid-Jacket-9641560763758545-1.jpg",
  "relaxed-fit-linen-shorts":
    "http://assets.myntassets.com/assets/images/productimage/2019/6/13/6d9cbad7-0743-4b42-9899-49f807887eb11560423363349-1.jpg",
};

/** Homepage hero & category tiles (Myntra CDN) */
export const HOME_DEMO_IMAGE_SOURCES = {
  heroNewSeason:
    "http://assets.myntassets.com/assets/images/10016283/2019/8/7/1cf85cd3-a7c5-47fe-b30d-31ec3c10f4411565173618884-Bollywood-Vogue-Customised-Off-White-Anarkali-Suit-215156517-1.jpg",
  heroWomen: DEMO_FASHION_IMAGE_CATALOG["floral-print-a-line-dress"],
  heroMen: DEMO_FASHION_IMAGE_CATALOG["lightweight-bomber-jacket"],
  categoryWomen: DEMO_FASHION_IMAGE_CATALOG["high-neck-bodycon-dress"],
  categoryMen: DEMO_FASHION_IMAGE_CATALOG["slim-fit-cotton-shirt"],
} as const;

export const HOME_DEMO_IMAGE_PATHS = {
  heroNewSeason: "/demo/home/hero-new-season.jpg",
  heroWomen: "/demo/home/hero-women.jpg",
  heroMen: "/demo/home/hero-men.jpg",
  categoryWomen: "/demo/home/category-women.jpg",
  categoryMen: "/demo/home/category-men.jpg",
} as const;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function imageUrlForSlug(slug: string): string | undefined {
  return DEMO_FASHION_IMAGE_CATALOG[slug];
}

export function imageUrlForProductName(name: string): string | undefined {
  return DEMO_FASHION_IMAGE_CATALOG[slugify(name)];
}
