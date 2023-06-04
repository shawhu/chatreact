/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        // rewrite requests to http://localhost:3000/api/v1/generate to
        // http://192.168.42.120:5000/api/v1/generate
        source: "/api/v1/generate",
        destination: "http://192.168.42.120:5000/api/v1/generate",
      },
    ];
  },
};

module.exports = nextConfig;
