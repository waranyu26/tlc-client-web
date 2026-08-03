import { CONFIG } from 'src/global-config';

import { CatalogView } from 'src/sections/catalog';

// ----------------------------------------------------------------------

const metadata = { title: `Catalog | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CatalogView />
    </>
  );
}
