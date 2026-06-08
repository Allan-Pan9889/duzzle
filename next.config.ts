import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.urbanic.com" },
      { protocol: "https", hostname: "in.urbanic.com" },
    ],
  },
};

export default nextConfig;
