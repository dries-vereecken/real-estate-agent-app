declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAOptions {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: object[];
    buildExcludes?: (string | RegExp)[];
    publicExcludes?: string[];
    fallbacks?: Record<string, string>;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
  }

  function withPWA(
    options: PWAOptions
  ): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
