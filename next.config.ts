/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure allowed dev origins to prevent HMR WebSocket connection block when accessed via tunnel URLs
  allowedDevOrigins: ['*.lhr.life', '*.loca.lt', 'localhost:3000'],
};

export default nextConfig;
