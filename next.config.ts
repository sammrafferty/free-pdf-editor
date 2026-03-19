import type { NextConfig } from "next";
import { execSync } from "child_process";

let commitHash = "unknown";
let commitDate = new Date().toISOString();
try {
  commitHash = execSync("git rev-parse --short HEAD").toString().trim();
  commitDate = execSync("git log -1 --format=%cI").toString().trim();
} catch {
  // Not in a git repo (e.g., Vercel CLI deploy) — use fallbacks
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
    NEXT_PUBLIC_COMMIT_DATE: commitDate,
  },
};

export default nextConfig;
