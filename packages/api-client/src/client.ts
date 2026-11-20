import createClient from 'openapi-fetch';
import type { paths } from './schema';

export interface CreateApiOptions {
  baseUrl: string;
  /** Admin uses cookie auth → include credentials. */
  credentials?: RequestCredentials;
}

/** One configured, typed client. Apps import this — never raw fetch to the API. */
export function createApi({ baseUrl, credentials }: CreateApiOptions) {
  return createClient<paths>({ baseUrl, credentials });
}

export type ApiClient = ReturnType<typeof createApi>;
