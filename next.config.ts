import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  // Ensure native node modules like pdf-parse work cleanly in server environment
  serverExternalPackages: ["pdf-parse", "pg"],
};

export default nextConfig;
