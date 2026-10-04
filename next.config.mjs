/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three ships modern syntax; let Next compile it for older browsers.
  transpilePackages: ['three'],
  images: {
    formats: ['image/avif', 'image/webp'],
    // Add your real image hosts here if project images live on a CDN.
    remotePatterns: [],
  },
};
export default nextConfig;
