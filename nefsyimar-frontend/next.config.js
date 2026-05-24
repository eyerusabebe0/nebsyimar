/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nefsyimar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.nefsyimar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.nefsyimar.wazabingo.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
