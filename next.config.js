/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Use estas vars se publicar em subpasta (ex.: GitHub Pages)
// ex.: NEXT_PUBLIC_BASE_PATH=/agrovision-pwa
const basePath = isProd ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : '';
const assetPrefix = isProd ? (process.env.NEXT_PUBLIC_BASE_PATH || undefined) : undefined;

// Config base compatível com `output: 'export'`
let config = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  basePath,
  assetPrefix,
};

// PWA opcional (apenas em produção, se o pacote existir)
// Evita cache de /_next/static pra não quebrar ao trocar de build
if (isProd) {
  try {
    const withPWA = require('next-pwa')({
      dest: 'public',
      disable: false,
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/.*\/_next\/static\//,
          handler: 'NetworkOnly',
        },
      ],
    });
    config = withPWA(config);
  } catch {
    console.warn('next-pwa não instalado; prosseguindo sem PWA.');
  }
}

module.exports = config;
