import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
    }
    config.externals.push('canvas');

    config.module.rules.push({
        test: /pdf\.worker\.js$/,
        type: 'asset/resource',
        generator: {
            filename: 'static/chunks/[name].[hash][ext]'
        }
    });

    return config;
  },
};

export default nextConfig;
