import { CONFIG } from 'src/global-config';

import { VerifyView } from 'src/sections/verify/verify-view';

// ----------------------------------------------------------------------

const metadata = { title: `Fairness check - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <VerifyView />
    </>
  );
}
