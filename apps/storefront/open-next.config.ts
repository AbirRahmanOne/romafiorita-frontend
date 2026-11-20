import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// OpenNext → Cloudflare Workers adapter. Keeps SSR/SSG + revalidation working.
// ponytail: adapter v1 peer-requires Next >=15.5.29; app is on 15.0.3. Bump Next to a
// 15.5+ patch before the first `build:cf`/`deploy`. Builds/lints fine until then.
export default defineCloudflareConfig();
