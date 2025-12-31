import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 動的レンダリングを強制（静的生成を無効化）
  output: undefined, // 'standalone' や 'export' が設定されていないことを確認
};

export default nextConfig;
