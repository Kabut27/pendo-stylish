/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tovuti inatumia <img> za kawaida (si next/image) ili kuepuka utata kwenye VPS ndogo.
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
