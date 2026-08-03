import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
        // The Pages export does not include the Cloudflare worker or D1 layer.
        // Vinext type-checks those runtime-only imports during its own build.
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
};

export default nextConfig;
