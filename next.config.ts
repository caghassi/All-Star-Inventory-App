import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App is deployed to Vercel; Printavo and Google APIs are called server-side only.
  experimental: {},
};

export default nextConfig;
