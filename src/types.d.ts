declare module "@stellarbeat/js-stellarbeat-shared/lib/network-schema";
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VUE_APP_TITLE: string;
  readonly VUE_APP_BRAND_NAME: string;
  readonly VUE_APP_BRAND_TAGLINE: string;
  readonly VUE_APP_BRAND_DESCRIPTION: string;
  readonly VUE_APP_BRAND_LOGO_SRC: string;
  readonly VUE_APP_BRAND_LOGO_ALT: string;
  readonly VUE_APP_BRAND_EMAIL: string;
  readonly VUE_APP_PUBLIC_API_URL: string;
  readonly VUE_APP_PUBLIC_ENABLE_NOTIFY: string;
  readonly VUE_APP_PUBLIC_ENABLE_HISTORY: string;
  readonly VUE_APP_PUBLIC_ENABLE_HORIZON: string;
  readonly VUE_APP_PUBLIC_ENABLE_CONFIG_EXPORT: string;
  readonly VUE_APP_ENABLE_DEMO_NETWORKS: string;
  readonly VUE_APP_TEST_API_URL: string;
  readonly VUE_APP_TEST_ENABLE_NOTIFY: string;
  readonly VUE_APP_TEST_ENABLE_HISTORY: string;
  readonly VUE_APP_SENTRY_DSN: string;
  readonly VUE_APP_ENABLE_NOTIFY: string;
  readonly PRERENDER_TOKEN: string;
  readonly VUE_APP_OWNER: string;
  readonly NODE_ENV: string;
  readonly VUE_APP_BLOG_URL: string;
  readonly VUE_APP_API_DOC_URL: string;
  readonly VUE_APP_PUBLIC_ENABLE_VALIDATOR_LOAD: string;
  readonly VUE_APP_TEST_ENABLE_HORIZON: string;
  readonly VUE_APP_TEST_ENABLE_VALIDATOR_LOAD: string;
  readonly VUE_APP_TEST_ENABLE_CONFIG_EXPORT: string;
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
