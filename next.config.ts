import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' http://localhost:5000 https://res.cloudinary.com data: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' http://localhost:5000 ws://localhost:3000",
              "font-src 'self' data:",
              "frame-ancestors 'self'",
            ].join("; ")
          }
        ]
      }
    ];
  },
};

export default nextConfig;
