/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ["okfgu9ruouq043ua.public.blob.vercel-storage.com"],
    },
    async rewrites() {
      return [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  