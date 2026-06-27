import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jvvulcnuxngfcbokiqdb.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
