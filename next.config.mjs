/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // تمام درخواست‌های /api/* در فرانت‌اند
        destination: "http://192.168.66.3:3000/api/:path*", // به سرور بک‌اند هدایت می‌شوند
      },
    ];
  },
};

export default nextConfig;
