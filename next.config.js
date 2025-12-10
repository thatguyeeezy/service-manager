/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WS_PORT: process.env.WS_PORT || 3001,
    NEXT_PUBLIC_WS_PORT: process.env.WS_PORT || 3001,
  },
}

module.exports = nextConfig

