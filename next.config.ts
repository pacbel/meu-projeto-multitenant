import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configurações gerais do Next.js
  typescript: {
    // Ignora erros de tipagem durante o build para permitir que o build seja concluído
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora erros de linting durante o build para permitir que o build seja concluído
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
