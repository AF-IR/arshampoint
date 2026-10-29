import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* Allow isolated verification builds (NEXT_DIST_DIR=.next-build bunx next build)
   * without touching the running dev server's .next — defaults to .next on Vercel. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
