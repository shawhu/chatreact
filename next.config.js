/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        //using local run llm
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:5000/api/v1/:path*",
      },
      {
        //using local run whisper
        source: "/api/transcribe",
        destination: "http://127.0.0.1:5500/transcribe",
      },
    ];
  },
};

module.exports = nextConfig;
