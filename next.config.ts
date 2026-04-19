import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.hive.baby",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "exifreader"],
  },
};

export default nextConfig;
