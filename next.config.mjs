/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // objdiff-wasm is an ESM WebAssembly Component: it loads its .wasm via
    // `new URL(..., import.meta.url)` and does a top-level await on init.
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      asyncWebAssembly: true,
    };
    // The wasm chunk uses top-level await; tell webpack the browser target
    // supports async functions so it emits it correctly (avoids the TLA warning).
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }
    return config;
  },
};

export default nextConfig;
