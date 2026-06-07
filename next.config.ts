import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/', destination: '/main' },
      { source: '/templates', destination: '/main/template' },
      { source: '/booth', destination: '/main/booth' },
      { source: '/payment', destination: '/main/payment' },
      { source: '/result', destination: '/main/result' },
      { source: '/strips-studio', destination: '/admin/template-studio' },
    ];
  },
};

export default nextConfig;
