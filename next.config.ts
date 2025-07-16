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
    // Exclude server-side modules from client-side bundle
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false, // fs is a server-side module
        };
    }

    // `canvas` is a server-side dependency of pdfjs-dist, we don't need it for client-side rendering
    config.externals.push('canvas');

    // Rule to handle pdf.worker.js, to copy it to the build output
    config.module.rules.push({
        test: /pdf\.worker\.min\.js$/,
        type: 'asset/resource',
        generator: {
            filename: 'static/chunks/[name].[hash][ext]'
        }
    });

    return config;
  },
};

export default nextConfig;
