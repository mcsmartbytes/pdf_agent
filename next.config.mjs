/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase body size limit for PDF uploads (Vercel Pro supports up to 50MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
