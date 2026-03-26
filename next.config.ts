import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/stock-terminal",
  images: { unoptimized: true },
};

export default nextConfig;
