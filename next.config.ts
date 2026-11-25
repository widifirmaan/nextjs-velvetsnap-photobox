import type { NextConfig } from "next";

const isStaticExport =
  process.env.STATIC_EXPORT === "1" ||
  process.env.CF_PAGES === "1" ||
  process.env.WORKERS_CI === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const, pageExtensions: ["tsx", "jsx"] } : {}),
  serverExternalPackages: ["@libsql/client"],
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
