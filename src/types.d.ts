declare module "vue-truncate-filter";
declare module "vuejs-datepicker";
declare module "vue2-timepicker";
declare module "miragejs";
declare module "vue2-leaflet-markercluster";
declare module "vue-lazy-hydration";
declare module "@stellarbeat/js-stellarbeat-shared/lib/network-schema";
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_BRAND_NAME: string;
  readonly VITE_APP_BRAND_TAGLINE: string;
  readonly VITE_APP_BRAND_DESCRIPTION: string;
  readonly VITE_APP_BRAND_LOGO_SRC: string;
  readonly VITE_APP_BRAND_LOGO_ALT: string;
  readonly VITE_APP_BRAND_EMAIL: string;
  readonly VITE_APP_PUBLIC_API_URL: string;
  readonly VITE_APP_PUBLIC_ENABLE_NOTIFY: string;
  readonly VITE_APP_PUBLIC_ENABLE_HISTORY: string;
  readonly VITE_APP_PUBLIC_ENABLE_HORIZON: string;
  readonly VITE_APP_PUBLIC_ENABLE_CONFIG_EXPORT: string;
  readonly VITE_APP_ENABLE_DEMO_NETWORKS: string;
  readonly VITE_APP_TEST_API_URL: string;
  readonly VITE_APP_TEST_ENABLE_NOTIFY: string;
  readonly VITE_APP_TEST_ENABLE_HISTORY: string;
  readonly VITE_APP_SENTRY_DSN: string;
  readonly VITE_APP_ENABLE_NOTIFY: string;
  readonly PRERENDER_TOKEN: string;
  readonly VITE_APP_OWNER: string;
  readonly NODE_ENV: string;
  readonly VITE_APP_BLOG_URL: string;
  readonly VITE_APP_API_DOC_URL: string;
  readonly VITE_APP_PUBLIC_ENABLE_VALIDATOR_LOAD: string;
  readonly VITE_APP_TEST_ENABLE_HORIZON: string;
  readonly VITE_APP_TEST_ENABLE_VALIDATOR_LOAD: string;
  readonly VITE_APP_TEST_ENABLE_CONFIG_EXPORT: string;
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
