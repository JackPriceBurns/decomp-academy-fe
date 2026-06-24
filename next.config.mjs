/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Amplify WEB_COMPUTE exposes console env vars to the build but not to the
  // Next.js server runtime. Inline COMPILE_API_URL at build time (when it IS
  // available) so the server-side compile proxy can read it at runtime.
  env: {
    COMPILE_API_URL: process.env.COMPILE_API_URL,
  },
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
