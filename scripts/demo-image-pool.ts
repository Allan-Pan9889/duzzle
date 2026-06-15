/**
 * One unique image URL per demo product (40 women + 40 men).
 * Myntra CDN where available; loremflickr fashion tags fill the rest (stable per lock id).
 */

export const WOMEN_IMAGE_POOL: readonly string[] = [
  // Myntra — verified Indian fashion
  "http://assets.myntassets.com/assets/images/productimage/2019/6/12/016671aa-1f0d-4606-972a-81c8a47cec7c1560361299556-1.jpg",
  "http://assets.myntassets.com/assets/images/10009723/2019/7/4/8156a265-8d11-4f91-b571-2ad632eb584f1562241896870-SPYKAR-Women-Blue-Skinny-Fit-Mid-Rise-Clean-Look-Stretchable-1.jpg",
  "http://assets.myntassets.com/assets/images/4033993/2018/3/14/11521023495997-na-7501521023495682-1.jpg",
  "http://assets.myntassets.com/assets/images/10001251/2019/11/7/37d94783-88a0-4b13-ba92-d97b441aa35b1573109836634-Black-Tulip-Skirt-3981573109834761-1.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/13/d749c6f3-3f27-485b-a1ea-849d2cc6c7551560384009508-1.jpg",
  "http://assets.myntassets.com/assets/images/4033590/2018/3/14/11521012081187-NA-7551521012081000-2.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/13/4ad97a5f-45e9-49fd-85ae-0279db9ed7971560398300505-1.jpg",
  "http://assets.myntassets.com/assets/images/10003387/2019/6/17/a9b1138a-569e-4572-a4ad-ad0b98211f5e1560763863792-Gini-and-Jony-Girls-Navy-Blue-Solid-Jacket-8921560763862756-1.jpg",
  "http://assets.myntassets.com/assets/images/10001251/2019/11/7/a42c2b51-e795-4f7d-af06-5716ccbd42101573109836596-Black-Tulip-Skirt-3981573109834761-2.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/13/fa8c0abf-1722-45e5-b2ba-c97cd77e50911560398300544-2.jpg",
  // Unsplash — verified GET 200
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80&auto=format&fit=crop",
  // LoremFlickr — unique lock per slot (fashion / women)
  ...Array.from({ length: 20 }, (_, i) =>
    `https://loremflickr.com/600/800/fashion,clothing,woman,dress?lock=${3000 + i * 17}`,
  ),
];

export const MEN_IMAGE_POOL: readonly string[] = [
  "http://assets.myntassets.com/assets/images/productimage/2019/6/13/64a02de5-be6e-4749-8cf8-4a5690da9ccd1560405868743-1.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/12/925f5115-c40c-4177-bc63-98b0b7f9f42e1560301313659-1.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/13/1868325d-870d-4e2f-bff2-2374969c49b41560388616822-1.jpg",
  "http://assets.myntassets.com/assets/images/10002181/2019/10/3/fcce0ccb-8f57-4bac-9e73-0b8f855c427c1570081641968-US-Polo-Assn-Denim-Co-Men-Navy-Blue-Solid-Bomber-Jacket-8951-1.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/12/f42cc3c7-3b67-4e49-8c8f-2c78828f04ca1560315793075-1.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/12/5a7909f8-30b3-4ade-bd8c-e1719a64fa581560302137879-1.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/13/0ffce1b0-0a88-4ca2-8caa-e35161cfc44c1560397564626-1.jpg",
  "http://assets.myntassets.com/assets/images/10005903/2020/2/12/0083a06a-1add-41cc-bc2e-d15d52d4ea4c1581508463267-Difference-of-Opinion-Men-Navy-Blue-Solid-Round-Neck-T-shirt-1.jpg",
  "http://assets.myntassets.com/assets/images/10003299/2019/6/17/dc8976cc-7d40-4c29-b6f0-2145d46b965e1560763759225-Gini-and-Jony-Boys-Red-Solid-Jacket-9641560763758545-1.jpg",
  "http://assets.myntassets.com/assets/images/productimage/2019/6/13/6d9cbad7-0743-4b42-9899-49f807887eb11560423363349-1.jpg",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80&auto=format&fit=crop",
  ...Array.from({ length: 26 }, (_, i) =>
    `https://loremflickr.com/600/800/fashion,clothing,man,shirt?lock=${4000 + i * 17}`,
  ),
];

export function assertUniqueImagePools(): void {
  for (const [label, pool] of [
    ["WOMEN", WOMEN_IMAGE_POOL],
    ["MEN", MEN_IMAGE_POOL],
  ] as const) {
    if (pool.length !== 40) {
      throw new Error(`${label} image pool must have 40 entries, got ${pool.length}`);
    }
    const unique = new Set(pool);
    if (unique.size !== pool.length) {
      throw new Error(`${label} image pool contains duplicate URLs`);
    }
  }
}

assertUniqueImagePools();
