import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pacotes do monorepo são TypeScript puro, compilados junto com o app.
  transpilePackages: ["@poker/engine", "@poker/bots", "@poker/progressao"],
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
