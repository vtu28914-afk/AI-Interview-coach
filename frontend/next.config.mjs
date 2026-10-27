/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : null);
    if (backendUrl) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
