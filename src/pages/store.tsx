import { CONFIG } from 'src/global-config';

import { StoreView } from 'src/sections/store';

// ----------------------------------------------------------------------

const metadata = { title: `Store | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <StoreView />
    </>
  );
}
