import { CONFIG } from 'src/global-config';

import { PackView } from 'src/sections/pack';

// ----------------------------------------------------------------------

const metadata = { title: `Pack | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <PackView />
    </>
  );
}
