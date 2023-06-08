/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        //using local run llm
        source: "/api/v1/generate",
        destination: "http://192.168.42.120:5000/api/v1/generate",
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
